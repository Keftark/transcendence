from Game import Board, Ball, Bricks, Paddle
import json
import threading
import time
import asyncio

WALL_OFFSET = 0.75

class Match:
    #default constructor for quick matches
    def __init__(self, id, p1, p2, ws):
        self._room_id = id
        self._spectators = []
        self._message_queue = []
        self._formatted_queue = []
        self._player_1_score = 0
        self._player_2_score = 0
        self._point_to_win = 5
        self._awaited_player_id = 0
        self._timer_count = 0
        self._max_time_seconds = -1
        self._board = Board.Board(25, 40)
        self._paddle_1 = Paddle.Paddle(p1, self._board.min_x + 1, 12, self._board.max_y, self._board.min_y)
        self._paddle_2 = Paddle.Paddle(p2, self._board.max_x - 2, 12, self._board.max_y, self._board.min_y)
        self._ball = Ball.Ball(self._room_id)
        self._initialised = False
        self._started = False
        self._ended = False
        self._needs_to_wait = False
        self._abandonned = False
        self._ragequitted = False
        self._timer_pause = True
        self._timer = time.time()
        self._lock = threading.Lock()
        self._message_locker = threading.Lock()
        self._ws = ws

    def load_parameters(self, payload):
        for data in payload:
            match data:
                case "id_p2":
                    self._paddle_2.id = (int)(payload[data])
                case "point":
                    self._point_to_win = (int)(payload[data])
                case "ball_radius":
                    self._ball.radius = (float)(payload[data])
                case "ball_speed":
                    self._ball.base_speed = (float)(payload[data])
                case "ball_increment":
                    self._ball.speed_increment = (float)(payload[data])
                case "max_time":
                    self._max_time_seconds = (int)(payload[data])
                case "board_x":
                    self._board.max_x = (int)(payload[data])
                    self._board.min_x = (int)(payload[data]) * -1
                    self._paddle_1.x = self._board.min_x + 1
                    self._paddle_2.x = self._board.max_x - 2
                case "board_y":
                    self._board.max_y = (int)(payload[data])
                    self._board.min_y = (int)(payload[data]) * -1

    def join_player(self):
        self._needs_to_wait = False
    
    def add_spectator(self, spec):
        self._spectators.append(spec)

    def remove_spectator(self, spec):
        self._spectators.remove(spec)
    
    def handle_closure(self):
        self._ended = True
        if self._player_1_ws is None:
            self._message_queue.append(self.dump_connection_lost(self._paddle_1.id))
            self._message_queue.append(self.dump_victory(self._paddle_1.id, "disconnected"))
        if self._player_2_ws is None:
            self._message_queue.append(self.dump_connection_lost(self._paddle_2.id))
            self._message_queue.append(self.dump_victory(self._paddle_2.id, "disconnected"))

    async def reset_board(self):
        self._ball.reset(True)
        self._paddle_1.reset()
        self._paddle_2.reset()
        self._timer_pause = True
        self.check_victory()
    
    def check_victory(self):
        if self._player_1_score >= self._point_to_win:
            self._ended = True
            self._message_queue.append(self.dump_victory(self._paddle_1.id, "points"))
        elif self._player_2_score >= self._point_to_win:
            self._ended = True
            self._message_queue.append(self._paddle_2.id, "points")
        elif self._max_time_seconds > 0 and self._timer_count >= self._max_time_seconds:
            if self._player_1_score > self._player_2_score:
                self._ended = True
                self._message_queue.append(self._paddle_1.id, "timer")
            elif self._player_1_score < self._player_2_score:
                self._ended = True
                self._message_queue.append(self._paddle_2.id, "timer")
            else:
                self._ended = True
                self._message_queue.append(self.dump_victory(0, "equal"))
    
    def restart_time(self):
        if (self._timer_pause is True):
            self._message_queue.append(self.dump_resume())
            self._timer = time.time()
        self._timer_pause = False

    def timer_tick(self):
        if (self._timer_pause is False):
            change = time.time() - self._timer
            if (change >= 1):
                self._timer_count += (int)(change)
                self._timer = time.time()
            self.check_victory()

    def tick(self):
        with self._lock:
            self.timer_tick()
            if (self._ended is True):
                if self._abandonned is True :
                    if self._quitter == self._paddle_1.id:
                        self._message_queue.append(self.dump_abandon(self._paddle_1.id))
                    elif self._quitter == self._paddle_2.id:
                        self._message_queue.append(self.dump_abandon(self._paddle_2.id))
                elif self._ragequitted is True:
                    if self._quitter == self._paddle_1.id:
                        self._message_queue.append(self.dump_ragequit(self._paddle_1.id))
                    elif self._quitter == self._paddle_2.id:
                        self._message_queue.append(self.dump_ragequit(self._paddle_2.id))
            if self._needs_to_wait is True:
                self._message_queue.append(self.dump_waiting_start2())
            elif self._initialised is False:
                self._initialised = True
                self._message_queue.append(self.dump_init())
            elif self._started is False:
                if self._paddle_1.ready is True and self._paddle_2.ready is True:
                    self._started = True
                    self._paddle_1.ready = False
                    self._paddle_2.ready = False
                    self._message_queue.append(self.dump_start())
                else:
                    self._message_queue.append(self.dump_waiting_start())
            elif self._paddle_1.ready is True and self._paddle_2.ready is True:
                self.restart_time()
                self._paddle_1.tick()
                self._paddle_2.tick()
                self._ball.update_position()
                if self._ball.y >= (self._board.max_y - WALL_OFFSET) or self._ball.y <= (self._board.min_y + WALL_OFFSET):
                    self._ball.bounce_horizontal()
                self._paddle_1.collide(self._ball)
                self._paddle_2.collide(self._ball)
                if self._ball.x < self._board.min_x: #point for p2
                    self._player_2_score += 1
                    self.reset_board()
                    self._message_queue.append(self.dump_point(self._paddle_2.id))
                elif self._ball.x > self._board.max_x: #point for p1
                    self._player_1_score += 1
                    self.reset_board()
                    self._message_queue.append(self.dump_point(self._paddle_1.id))
                self._message_queue.append(self.dump_variables())
            else:
                self._message_queue.append(self.dump_waiting())
        self.format()

    def format(self):
        id_list = []
        id_list.append(self._paddle_1.id)
        id_list.append(self._paddle_2.id)
        id_list.extend(self._spectators)
        for event in self._message_queue:
            data = {
                "type": "match_data",
                "server": "1v1_classic",
                "answer": "yes",
                "ids": id_list,
                "data": event
            }
            self._formatted_queue.append(data)
        self._message_queue.clear()

    def input(self, input):
        try:
            with self._lock:
                if (input["type"] == "input"):
                    if ((int)(input["id"]) == self._paddle_1.id):
                        self._paddle_1.input_move(input)
                    elif ((int)(input["id"]) == self._paddle_2.id):
                        self._paddle_2.input_move(input)
                elif (input["type"] == "quit_lobby"):
                    if ((int)(input["id"]) == self._paddle_1.id or (int)(input["id"]) == self._paddle_2.id):
                        self._ended = True
                        self._quitter = (int)(input["id"])
                        if (self._started is False):
                            self._abandonned = True
                        else:
                            self._ragequitted = True
                elif (input["type"] == "ready"):
                    if ((int)(input["id"]) == self._paddle_1.id):
                        self._paddle_1.ready = True
                    if ((int)(input["id"]) == self._paddle_2.id):
                        self._paddle_2.ready = True
                elif (input["type"] == "pause"):
                    if ((int)(input["id"]) == self._paddle_1.id):
                        self._paddle_1.ready = False
                    if ((int)(input["id"]) == self._paddle_2.id):
                        self._paddle_2.ready = False
        except: #unknown JSON case, ignore it
            pass

    def dump_connection_lost(self, player):
        event = {
            "type": "connection_lost",
            "room_id": self._room_id,
            "player": player
        }
        return event
    
    def dump_point(self, player):
        event = {
            "type": "point",
            "room_id": self._room_id,
            "player": player
        }
        return event

    def dump_victory(self, player, mode):
        event = {
            "type": "victory",
            "room_id": self._room_id,
            "mode": mode,
            "player": player
        }
        return event

    def dump_abandon(self, player):
        event = {
            "type": "victory",
            "room_id": self._room_id,
            "mode": "abandon",
            "player": player
        }
        return event
    
    def dump_ragequit(self, player):
        event = {
            "type": "victory",
            "room_id": self._room_id,
            "mode": "ragequit",
            "player": player
        }
        return event
    
    def dump_waiting(self):
        event = {
            "type": "wait_ready",
            "room_id": self._room_id,
            "p1_state": self._paddle_1.ready,
            "p2_state": self._paddle_2.ready
        }
        return event
    
    def dump_waiting_start(self):
        event = {
            "type": "wait_start",
            "room_id": self._room_id,
            "p1_state": self._paddle_1.ready,
            "p2_state": self._paddle_2.ready
        }
        return event
    
    def dump_waiting_start2(self):
        event = {
            "type": "wait_start_invited",
            "room_id": self._room_id,
            "p1_state": self._paddle_1.ready,
            "p2_state": self._paddle_2.ready
        }
        return event

    def dump_init(self):
        event = {
            "type": "match_init",
            "room_id": self._room_id,
            "id_p1": self._paddle_1.id,
            "id_p2": self._paddle_2.id
        }
        return event
    
    def dump_start(self):
        event = {
            "type": "match_start",
            "room_id": self._room_id,
            "id_p1": self._paddle_1.id,
            "id_p2": self._paddle_2.id
        }
        return event
    
    def dump_resume(self):
        event = {
            "type": "match_resume",
            "room_id": self._room_id
        }
        return event

    def dump_variables(self):
        event = {
            "type": "tick",
            "room_id": self._room_id,
            "p1_pos": self._paddle_1.y,
            "p2_pos": self._paddle_2.y,
            "p1_score": self._player_1_score,
            "p2_score": self._player_2_score,
            "p1_boosting": self._paddle_1.is_powered_up,
            "p2_boosting": self._paddle_2.is_powered_up,
            "p1_juice": self._paddle_1.power,
            "p2_juice": self._paddle_2.power,
            "ball_x": self._ball.x,
            "ball_y": self._ball.y,
            "ball_speed": self._ball.speed,
            "ball_boosting": self._ball.is_powered_up,
            "timer": self._timer_count 
        }
        return event  
    
    @property
    def room_id(self):
        return self._room_id

    @room_id.setter
    def room_id(self, value):
        self._room_id = value

    @property
    def spectators(self):
        return self._spectators

    @spectators.setter
    def spectators(self, value):
        self._spectators = value

    @property
    def message_queue(self):
        return self._message_queue

    @message_queue.setter
    def message_queue(self, value):
        self._message_queue = value

    @property
    def formatted_queue(self):
        return self._formatted_queue

    @formatted_queue.setter
    def formatted_queue(self, value):
        self._formatted_queue = value

    @property
    def player_1_score(self):
        return self._player_1_score

    @player_1_score.setter
    def player_1_score(self, value):
        self._player_1_score = value

    @property
    def player_2_score(self):
        return self._player_2_score

    @player_2_score.setter
    def player_2_score(self, value):
        self._player_2_score = value

    @property
    def point_to_win(self):
        return self._point_to_win

    @point_to_win.setter
    def point_to_win(self, value):
        self._point_to_win = value

    @property
    def awaited_player_id(self):
        return self._awaited_player_id

    @awaited_player_id.setter
    def awaited_player_id(self, value):
        self._awaited_player_id = value

    @property
    def timer_count(self):
        return self._timer_count

    @timer_count.setter
    def timer_count(self, value):
        self._timer_count = value

    @property
    def max_time_seconds(self):
        return self._max_time_seconds

    @max_time_seconds.setter
    def max_time_seconds(self, value):
        self._max_time_seconds = value

    @property
    def board(self):
        return self._board

    @board.setter
    def board(self, value):
        self._board = value

    @property
    def paddle_1(self):
        return self._paddle_1

    @paddle_1.setter
    def paddle_1(self, value):
        self._paddle_1 = value

    @property
    def paddle_2(self):
        return self._paddle_2

    @paddle_2.setter
    def paddle_2(self, value):
        self._paddle_2 = value

    @property
    def ball(self):
        return self._ball

    @ball.setter
    def ball(self, value):
        self._ball = value

    @property
    def initialised(self):
        return self._initialised

    @initialised.setter
    def initialised(self, value):
        self._initialised = value

    @property
    def started(self):
        return self._started

    @started.setter
    def started(self, value):
        self._started = value

    @property
    def ended(self):
        return self._ended

    @ended.setter
    def ended(self, value):
        self._ended = value

    @property
    def needs_to_wait(self):
        return self._needs_to_wait

    @needs_to_wait.setter
    def needs_to_wait(self, value):
        self._needs_to_wait = value

    @property
    def abandonned(self):
        return self._abandonned

    @abandonned.setter
    def abandonned(self, value):
        self._abandonned = value

    @property
    def ragequitted(self):
        return self._ragequitted

    @ragequitted.setter
    def ragequitted(self, value):
        self._ragequitted = value

    @property
    def timer_pause(self):
        return self._timer_pause

    @timer_pause.setter
    def timer_pause(self, value):
        self._timer_pause = value

    @property
    def timer(self):
        return self._timer

    @timer.setter
    def timer(self, value):
        self._timer = value

    @property
    def lock(self):
        return self._lock

    @lock.setter
    def lock(self, value):
        self._lock = value

    @property
    def message_locker(self):
        return self._message_locker

    @message_locker.setter
    def message_locker(self, value):
        self._message_locker = value

    
    def set_private_match(self):
        self._needs_to_wait = True