"""Class for the matches. Holy moly why did I decide on using a linter ?"""

import threading
import time
from Game.paddle import Paddle
from Game.ball import Ball
from Game.board import Board

WALL_OFFSET = 0.75

class Match:
    """Class to handle matches. Kinda wack
    """
    def __init__(self, _id, p1, p2):
        self._room_id = _id
        self._spectators = []
        self._message_queue = []
        self._formatted_queue = []
        self._player_1_score = 0
        self._player_2_score = 0
        self._point_to_win = 5
        self._awaited_player_id = 0
        self._timer_count = 0
        self._quitter = 0
        self._max_time_seconds = -1
        self._board = Board(25, 40)
        self._paddle_1 = Paddle(p1, self._board.min_x + 1, 12, \
                                       self._board.max_y, self._board.min_y)
        self._paddle_2 = Paddle(p2, self._board.max_x - 2, 12, \
                                       self._board.max_y, self._board.min_y)
        self._ball = Ball(self._room_id)
        self._initialised = False
        self._started = False
        self._ended = False
        self._needs_to_wait = False
        self._abandonned = False
        self._ragequitted = False
        self._timer_pause = True
        self._concluded = False
        self._timer = time.time()
        self._lock = threading.Lock()
        self._message_locker = threading.Lock()

    def load_parameters(self, payload):
        """Loads the custom parameters of the match.

        Args:
            payload (dict): list of custom parameters.
        """
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
        """Notify the match that the awaited player has joined.
        """
        self._needs_to_wait = False

    def add_spectator(self, spec):
        """Adds a spectator to the room.

        Args:
            spec (int): ID of the spectator.
        """
        self._spectators.append(spec)

    def remove_spectator(self, spec):
        """Remove the spectator from the room.

        Args:
            spec (int): ID of the spectator.
        """
        self._spectators.remove(spec)

    def reset_board(self):
        """Reset the board, the ball, and the paddle.
        """
        self._ball.reset(True)
        self._paddle_1.reset()
        self._paddle_2.reset()
        self._timer_pause = True
        self.check_victory()

    def check_victory(self):
        """Checks wether or not the victory has been attained.
        Sets the match to finished if it is.
        """
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
        """Restarts the timer of the match.
        """
        if self._timer_pause is True:
            self._message_queue.append(self.dump_resume())
            self._timer = time.time()
        self._timer_pause = False

    def timer_tick(self):
        """Ticks the timer.
        """
        if self._timer_pause is False:
            change = time.time() - self._timer
            if change >= 1:
                self._timer_count += (int)(change)
                self._timer = time.time()
            self.check_victory()

    def tick(self):
        """Ticks the match, updating the ball and players positions.
        """
        with self._lock:
            self.timer_tick()
            if self._concluded is True:
                return
            if self._ended is True:
                self._concluded = True
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
            elif self._needs_to_wait is True:
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
                if self._ball.y >= (self._board.max_y - WALL_OFFSET) \
                        or self._ball.y <= (self._board.min_y + WALL_OFFSET):
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
        """Formats the message list.
        """
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

    def input(self, value):
        """_summary_

        Args:
            value (_type_): _description_
        """
        try:
            with self._lock:
                if value["type"] == "input":
                    if (int)(value["id"]) == self._paddle_1.id:
                        self._paddle_1.input_move(value)
                    elif (int)(value["id"])== self._paddle_2.id:
                        self._paddle_2.input_move(value)
                elif value["type"] == "quit_lobby":
                    if (int)(value["id"]) == self._paddle_1.id \
                                or (int)(value["id"]) == self._paddle_2.id:
                        self._ended = True
                        self._quitter = (int)(value["id"])
                        if self._started is False:
                            self._abandonned = True
                        else:
                            self._ragequitted = True
                elif value["type"] == "ready":
                    if (int)(value["id"]) == self._paddle_1.id:
                        self._paddle_1.ready = True
                    if (int)(value["id"]) == self._paddle_2.id:
                        self._paddle_2.ready = True
                elif value["type"] == "pause":
                    if (int)(value["id"]) == self._paddle_1.id:
                        self._paddle_1.ready = False
                    if (int)(value["id"]) == self._paddle_2.id:
                        self._paddle_2.ready = False
        except Exception as e: #unknown JSON case, ignore it
            print(e)

    def generate_invitation(self):
        """Generate an invitation for the awaited player.
        """
        self._formatted_queue.append(self.dump_invitation())

    def dump_invitation(self):
        """Generates the dump for an invitation

        Returns:
            _type_: _description_
        """
        event = {
            "type": "invite",
            "server": "1v1_classic",
            "answer": "yes",
            "ids": [self._paddle_2.id],
            "data": {
                "type": "invite",
                "from": self._paddle_1.id,
                "room_id" : self._room_id
            }
        }
        return event

    def dump_point(self, player):
        """Dump for a point scored.

        Args:
            player (int): ID of the player who scored.

        Returns:
            dict: dump for the point.
        """
        event = {
            "type": "point",
            "room_id": self._room_id,
            "player": player
        }
        return event

    def dump_victory(self, player, mode):
        """Dump for a victory.

        Args:
            player (int): ID of the player who won.
            mode (string): type of victory.

        Returns:
            dict: dump for the victory.
        """
        event = {
            "type": "victory",
            "room_id": self._room_id,
            "mode": mode,
            "player": player
        }
        return event

    def dump_abandon(self, player):
        """Dump for match abandon.

        Args:
            player (int): ID of the player who abandonned.

        Returns:
            dict: Dump of abandon.
        """
        event = {
            "type": "victory",
            "room_id": self._room_id,
            "mode": "abandon",
            "player": player
        }
        return event

    def dump_ragequit(self, player):
        """Dump for match ragequit.

        Args:
            player (int): ID of the player who ragequitted.

        Returns:
            dict: Dump of ragequit.
        """
        event = {
            "type": "victory",
            "room_id": self._room_id,
            "mode": "ragequit",
            "player": player
        }
        return event

    def dump_waiting(self):
        """Dump that notifies the match is paused.

        Returns:
            dict: the dump.
        """
        event = {
            "type": "wait_ready",
            "room_id": self._room_id,
            "p1_state": self._paddle_1.ready,
            "p2_state": self._paddle_2.ready
        }
        return event

    def dump_waiting_start(self):
        """Dump that notifies that the match is ready to start.

        Returns:
            dict: the dump.
        """
        event = {
            "type": "wait_start",
            "room_id": self._room_id,
            "p1_state": self._paddle_1.ready,
            "p2_state": self._paddle_2.ready
        }
        return event

    def dump_waiting_start2(self):
        """Dump that notifies that the match is ready to start, 
        and waiting for the invited player.

        Returns:
            dict: the dump.
        """
        event = {
            "type": "wait_start_invited",
            "room_id": self._room_id,
            "p1_state": self._paddle_1.ready,
            "p2_state": self._paddle_2.ready
        }
        return event

    def dump_init(self):
        """Dump that means the match have been initialized.

        Returns:
            dict: the dump.
        """
        event = {
            "type": "match_init",
            "room_id": self._room_id,
            "id_p1": self._paddle_1.id,
            "id_p2": self._paddle_2.id
        }
        return event

    def dump_start(self):
        """Dump that means the match has started.

        Returns:
            dict: the dump.
        """
        event = {
            "type": "match_start",
            "room_id": self._room_id,
            "id_p1": self._paddle_1.id,
            "id_p2": self._paddle_2.id
        }
        return event

    def dump_resume(self):
        """Dump that means the match has resumed.

        Returns:
            dict: the dump.
        """
        event = {
            "type": "match_resume",
            "room_id": self._room_id
        }
        return event

    def dump_variables(self):
        """Massive supreme deluxe dump that returns all the variables
        needed to update the match's view.

        Returns:
            dict: the big dumpy.
        """
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
        """Returns the room id of the match.

        Returns:
            int: The room ID.
        """
        return self._room_id

    @room_id.setter
    def room_id(self, value):
        self._room_id = value

    @property
    def spectators(self):
        """Returns the list of specators.

        Returns:
            dict: the list of spectators.
        """
        return self._spectators

    @spectators.setter
    def spectators(self, value):
        self._spectators = value

    @property
    def message_queue(self):
        """Returns the message queue.

        Returns:
            dict: the message queue.
        """
        return self._message_queue

    @message_queue.setter
    def message_queue(self, value):
        self._message_queue = value

    @property
    def formatted_queue(self):
        """Returns the formatted queue, ready to be sent
        to the central server.

        Returns:
            dict: the message queue.
        """
        return self._formatted_queue

    @formatted_queue.setter
    def formatted_queue(self, value):
        self._formatted_queue = value

    @property
    def player_1_score(self):
        """Returns the score of the player 1.

        Returns:
            int: P1 score
        """
        return self._player_1_score

    @player_1_score.setter
    def player_1_score(self, value):
        self._player_1_score = value

    @property
    def player_2_score(self):
        """Returns the score of the player 2.

        Returns:
            int: P2 score
        """
        return self._player_2_score

    @player_2_score.setter
    def player_2_score(self, value):
        self._player_2_score = value

    @property
    def point_to_win(self):
        """Returns the amount of points needed to win.

        Returns:
            int: the amount of points.
        """
        return self._point_to_win

    @point_to_win.setter
    def point_to_win(self, value):
        self._point_to_win = value

    @property
    def awaited_player_id(self):
        """Returns the invited player's ID.

        Returns:
            int: The ID of the player.
        """
        return self._awaited_player_id

    @awaited_player_id.setter
    def awaited_player_id(self, value):
        self._awaited_player_id = value

    @property
    def timer_count(self):
        """Returns the timer count in seconds.

        Returns:
            int: the seconds elapsed.
        """
        return self._timer_count

    @timer_count.setter
    def timer_count(self, value):
        self._timer_count = value

    @property
    def max_time_seconds(self):
        """Returns the max lengths of the match in seconds.

        Returns:
            int: the max lengths.
        """
        return self._max_time_seconds

    @max_time_seconds.setter
    def max_time_seconds(self, value):
        self._max_time_seconds = value

    @property
    def board(self):
        """Returns the board object.

        Returns:
            Board: the board.
        """
        return self._board

    @board.setter
    def board(self, value):
        self._board = value

    @property
    def paddle_1(self):
        """Returns the paddle object of the player 1.

        Returns:
            Paddle: the paddle of P1.
        """
        return self._paddle_1

    @paddle_1.setter
    def paddle_1(self, value):
        self._paddle_1 = value

    @property
    def paddle_2(self):
        """Returns the paddle object of the player 2.

        Returns:
            Paddle: the paddle of P2.
        """
        return self._paddle_2

    @paddle_2.setter
    def paddle_2(self, value):
        self._paddle_2 = value

    @property
    def ball(self):
        """Returns the ball object.

        Returns:
            Ball: the ball.
        """
        return self._ball

    @ball.setter
    def ball(self, value):
        self._ball = value

    @property
    def initialised(self):
        """Returns wether the match is initialized or not.

        Returns:
            bool: the initialization status.
        """
        return self._initialised

    @initialised.setter
    def initialised(self, value):
        self._initialised = value

    @property
    def started(self):
        """Returns wether the match is started or not.

        Returns:
            bool: the started status.
        """
        return self._started

    @started.setter
    def started(self, value):
        self._started = value

    @property
    def ended(self):
        """Returns wether the match is ended or not.

        Returns:
            bool: the end status (dragon dead).
        """
        return self._ended

    @ended.setter
    def ended(self, value):
        self._ended = value

    @property
    def needs_to_wait(self):
        """Returns wether the match needs to wait the invited player.

        Returns:
            bool: the status.
        """
        return self._needs_to_wait

    @needs_to_wait.setter
    def needs_to_wait(self, value):
        self._needs_to_wait = value

    @property
    def abandonned(self):
        """Returns wether the match is initialized or not.

        Returns:
            bool: the initialization status.
        """
        return self._abandonned

    @abandonned.setter
    def abandonned(self, value):
        self._abandonned = value

    @property
    def ragequitted(self):
        """Returns wether the match is abandonned or not.

        Returns:
            bool: the abandon status.
        """
        return self._ragequitted

    @ragequitted.setter
    def ragequitted(self, value):
        self._ragequitted = value

    @property
    def timer_pause(self):
        """Returns wether the timer is paused or not.

        Returns:
            bool: the pause status.
        """
        return self._timer_pause

    @timer_pause.setter
    def timer_pause(self, value):
        self._timer_pause = value

    @property
    def timer(self):
        """Returns the timer data.

        Returns:
            float: timer data.
        """
        return self._timer

    @timer.setter
    def timer(self, value):
        self._timer = value

    @property
    def lock(self):
        """Returns the mutex for the data.

        Returns:
            Lock: the mutex.
        """
        return self._lock

    @lock.setter
    def lock(self, value):
        self._lock = value

    @property
    def message_locker(self):
        """Returns the mutex for the messages.

        Returns:
            Lock: the mutex.
        """
        return self._message_locker

    @message_locker.setter
    def message_locker(self, value):
        self._message_locker = value
