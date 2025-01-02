from Game import Board, Ball, Bricks, Paddle
import json
import threading
import time
import asyncio

class Match2:
    #default constructor for quick matches
    def __init__(self, id, p1, p2, w1, w2):
        self._room_id = id
        self._player_1_ws = w1
        self._player_2_ws = w2
        self._spectators = []
        self._player_1_score = 0
        self._player_2_score = 0
        self._point_to_win = 5
        self._board = Board.Board(25, 40)
        self._paddle_1 = Paddle.Paddle(p1, self._board.min_x + 1, 12, self._board.max_y, self._board.min_y)
        self._paddle_2 = Paddle.Paddle(p2, self._board.max_x - 2, 12, self._board.max_y, self._board.min_y)
        self._ball = Ball.Ball()
        self._initialised = False
        self._started = False
        self._ended = False
        self._needs_to_wait = False
        self._abandonned = False
        self._ragequitted = False
        self._awaited_player_id = 0
        self._lock = threading.Lock()
        self._max_time_seconds = 300
        self._timer = time.time()
        self._timer_pause = True
        self._message_locker = asyncio.Lock()

    def load_parameters(self, id, w1, payload):
        self._room_id = id
        self._player_1_ws = w1
        self._player_2_ws = None
        self._spectators = []
        self._player_1_score = 0
        self._player_2_score = 0
        self._initialised = False
        self._started = False
        self._ended = False
        self._quitter = 0
        self._needs_to_wait = True
        self.parse_payload(payload)
        self._awaited_player_id = self._paddle_2.id
        self._lock = threading.Lock()
        self._max_time_seconds = 300
        self._timer = time.time()
        self._timer_pause = True
        self._message_locker = asyncio.Lock()

    #reads from the payload, and loads game parameters from it.
    def parse_payload(self, payload):
        self._point_to_win = (int)(payload["points"])
        x = (int)(payload["board_x"])
        y = (int)(payload["board_y"])
        self._board = Board.Board(x, y)
        p1 = (int)(payload["p1_id"])
        p2 = (int)(payload["p2_id"])
        self._paddle_1 = Paddle.Paddle(p1, self._board.min_x + 1, 12, self._board.max_y, self._board.min_y)
        self._paddle_2 = Paddle.Paddle(p2, self._board.max_x - 2, 12, self._board.max_y, self._board.min_y)
        ball_radius = (int)(payload["ball_radius"])
        ball_speed = (int)(payload["ball_speed"])
        ball_increment = (int)(payload["ball_increment"])
        self._ball = Ball.Ball()
        self._ball.load_parameters(ball_radius, ball_speed, ball_increment)
        self._max_time_seconds = (int)(payload["max_time"])

    def join_player(self, websocket):
        self._player_2_ws = websocket
        self._needs_to_wait = False
    
    def add_spectator(self, spec):
        self._spectators.append(spec)

    def remove_spectator(self, spec):
        self._spectators.remove(spec)

    #ping the websocket. Set them to None if they're closed
    async def ping(self):
        try: 
            await self._player_1_ws.send(json.dumps({"type":"ping"}))
        except:
            self._player_1_ws = None
        try: 
            await self._player_2_ws.send(json.dumps({"type":"ping"}))
        except:
            self._player_2_ws = None
        
    async def handle_closure(self):
        self._ended = True
        if self._player_1_ws is None:
            await self.send_to_web(self.dump_connection_lost(self._paddle_1.id))
        else:
            await self.send_to_web(self.dump_connection_lost(self._paddle_2.id))

    async def reset_board(self):
        self._ball.reset(True)
        self._paddle_1.reset()
        self._paddle_2.reset()
        self._timer_pause = True
        await self.check_victory()

    async def check_victory(self):
        if self._player_1_score >= self._point_to_win:
            self._ended = True
            await self.send_to_web(self.dump_victory(self._paddle_1.id, "points"))
        elif self._player_2_score >= self._point_to_win:
            self._ended = True
            await self.send_to_web(self.dump_victory(self._paddle_2.id, "points"))
        elif self._max_time_seconds <= 0:
            if self._player_1_score > self._player_2_score:
                self._ended = True
                await self.send_to_web(self.dump_victory(self._paddle_1.id, "timer"))
            elif self._player_1_score < self._player_2_score:
                self._ended = True
                await self.send_to_web(self.dump_victory(self._paddle_2.id, "timer"))
            else:
                self._ended = True
                await self.send_to_web(self.dump_victory(0, "equal"))
    
    def restart_time(self):
        if (self._timer_pause is True):
            self._timer = time.time()
        self._timer_pause = False

    async def timer_tick(self):
        if (self._timer_pause is False):
            change = time.time() - self._timer
            if (change >= 1):
                self._max_time_seconds -= (int)(change)
                self._timer = time.time()
            await self.check_victory()
    
    async def tick(self):
        with self._lock:
            await self.timer_tick()
            if (self._ended is True):
                if self._abandonned is True :
                    if self._quitter == self._paddle_1.id:
                        await self.send_to_web(self.dump_abandon(self._paddle_1.id))
                    elif self._quitter == self._paddle_2.id:
                        await self.send_to_web(self.dump_abandon(self._paddle_2.id))
                elif self._ragequitted is True:
                    if self._quitter == self._paddle_1.id:
                        await self.send_to_web(self.dump_ragequit(self._paddle_1.id))
                    elif self._quitter == self._paddle_2.id:
                        await self.send_to_web(self.dump_ragequit(self._paddle_2.id))
            if self._needs_to_wait is True:
                await self.send_to_web(self.dump_waiting_start2())
            elif self._player_1_ws is None or self._player_2_ws is None:
                await self.handle_closure()
            elif self._initialised is False:
                self._initialised = True
                await self.send_to_web(self.dump_init())
            elif self._started is False:
                if self._paddle_1.ready is True and self._paddle_2.ready is True:
                    self._started = True
                    self._paddle_1.ready = False
                    self._paddle_2.ready = False
                    await self.send_to_web(self.dump_start())
                await self.send_to_web(self.dump_waiting_start())
            elif self._paddle_1.ready is True and self._paddle_2.ready is True:
                self.restart_time()
                self._paddle_1.tick()
                self._paddle_2.tick()
                self._ball.update_position()
                if self._ball.y >= self._board.max_y or self._ball.y <= self._board.min_y:
                    self._ball.bounce_horizontal()
                self._paddle_1.collide(self._ball)
                self._paddle_2.collide(self._ball)
                if self._ball.x < self._board.min_x: #point for p2
                    self._player_2_score += 1
                    await self.reset_board()
                    await self.send_to_web(self.dump_point(self._paddle_2.id))
                elif self._ball.x > self._board.max_x: #point for p1
                    self._player_1_score += 1
                    await self.reset_board()
                    await self.send_to_web(self.dump_point(self._paddle_1.id))
                await self.send_to_web(self.dump_variables())
            else:
                await self.send_to_web(self.dump_waiting())
                
    
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
    
    async def send_to_web(self, dump):
        async with self._message_locker:
            event = json.dumps(dump)
            try:
                await self._player_1_ws.send(event)
            except:
                self._player_1_ws = None
            try:
                await self._player_2_ws.send(event)
            except:
                self._player_2_ws = None
            for spectator in self._spectators:
                try: 
                    await spectator.send(event)
                except: 
                    self._spectators.remove(spectator)

    def dump_connection_lost(self, player):
        event = {
            "type": "connection_lost",
            "room_id": self._room_id,
            "player": player,
        }
        return event
    
    def dump_point(self, player):
        event = {
            "type": "point",
            "room_id": self._room_id,
            "player": player,
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
            "p2_state": self._paddle_2.ready,
        }
        return event
    
    def dump_waiting_start(self):
        event = {
            "type": "wait_start",
            "room_id": self._room_id,
            "p1_state": self._paddle_1.ready,
            "p2_state": self._paddle_2.ready,
        }
        return event
    
    def dump_waiting_start2(self):
        event = {
            "type": "wait_start_invited",
            "room_id": self._room_id,
            "p1_state": self._paddle_1.ready,
            "p2_state": self._paddle_2.ready,
        }
        return event

    def dump_init(self):
        event = {
            "type": "match_init",
            "room_id": self._room_id,
            "id_p1": self._paddle_1.id,
            "id_p2": self._paddle_2.id,
        }
        return event
    
    def dump_start(self):
        event = {
            "type": "match_start",
            "room_id": self._room_id,
            "id_p1": self._paddle_1.id,
            "id_p2": self._paddle_2.id,
        }
        return event

    def dump_bounce(self):
        event = {
            "type": "bounce",
            "room_id": self._room_id,
            "ball_x": self._ball.x,
            "ball_y": self._ball.y,
            "ball_speed": self._ball.speed
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
            "timer": self._max_time_seconds
        }
        return event

    @property
    def room_id(self):
        return self._room_id

    @room_id.setter
    def room_id(self, value):
        self._room_id = value

    @property
    def player_1_ws(self):
        return self._player_1_ws

    @player_1_ws.setter
    def player_1_ws(self, value):
        self._player_1_ws = value

    @property
    def player_2_ws(self):
        return self._player_2_ws

    @player_2_ws.setter
    def player_2_ws(self, value):
        self._player_2_ws = value

    @property
    def spectators(self):
        return self._spectators

    @spectators.setter
    def spectators(self, value):
        self._spectators = value

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
    def board(self):
        return self._board

    @board.setter
    def board(self, value):
        self._board = value

    @property
    def player_1_paddle(self):
        return self._paddle_1

    @player_1_paddle.setter
    def player_1_paddle(self, value):
        self._paddle_1 = value

    @property
    def player_2_paddle(self):
        return self._paddle_2

    @player_2_paddle.setter
    def player_2_paddle(self, value):
        self._paddle_2 = value

    @property
    def ball(self):
        return self._ball

    @ball.setter
    def ball(self, value):
        self._ball = value

    @property
    def player_1_ready(self):
        return self._paddle_1.ready

    @player_1_ready.setter
    def player_1_ready(self, value):
        self._paddle_1.ready = value

    @property
    def player_2_ready(self):
        return self._paddle_2.ready

    @player_2_ready.setter
    def player_2_ready(self, value):
        self._paddle_2.ready = value

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
    def lock(self):
        return self._lock

    @lock.setter
    def lock(self, value):
        self._lock = value

    @property
    def needs_to_wait(self):
        return self._needs_to_wait

    @needs_to_wait.setter
    def needs_to_wait(self, value):
        self._needs_to_wait = value

    @property
    def awaited_player_id(self):
        return self._awaited_player_id

    @awaited_player_id.setter
    def awaited_player_id(self, value):
        self._awaited_player_id = value