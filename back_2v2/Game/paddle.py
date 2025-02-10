""""Paddle"""

from Game.bouncable import Bouncable

DEFAULT_SPEED = 0.75
MOVE_UP    = 1
MOVE_DOWN  = -1
MOVE_NONE = 0

class Paddle(Bouncable):
    """A paddle, the player character.
    """
    def __init__(self, _id, x, _len, board_top_y, board_bottom_y):
        super().__init__(x, (board_top_y + board_bottom_y) / 2, 0.5, _len)
        self._id = _id
        self._speed = DEFAULT_SPEED
        self._y_max = board_top_y
        self._y_min = board_bottom_y
        self._vertical = MOVE_NONE
        self._ready = False
        self._power = 0
        self._power_per_bounce = 25
        self._power_multiplier = 2
        self._is_powered_up = False
        #Event list
        self._message_queue = []
        #Player stats
        self._speed_bonus = 0
        self._power_bonus = 0
        self._bounce_bonus = 1

    def set_up(self, payload):
        """Loads optionnal parameters.

        Args:
            payload (dict): contains optional parameters.
        """
        for data in payload:
            match data:
                case "length":
                    super()._length = (int)(payload[data])
                case "power":
                    self._power_bonus = (int)(payload[data])
                case "speed":
                    self._speed_bonus = (int)(payload[data])
                case "bounce":
                    self._bounce_bonus = (int)(payload[data])

    def move_up(self):
        """Displaces the paddle up.
        """
        if self.upper_bound() < self._y_max:
            self._y += self._speed + self._speed_bonus

    def move_down(self):
        """Displaces the paddle down.
        """
        if self.lower_bound() > self._y_min:
            self._y -= self._speed + self._speed_bonus

    def set_move_up(self):
        """Sets the movement of the paddle upwards.
        """
        self._vertical = MOVE_UP

    def set_move_down(self):
        """Sets the movement of the paddle downwards.
        """
        self._vertical = MOVE_DOWN

    def set_move_stop(self):
        """Stops the movement of the paddle.
        """
        self._vertical = MOVE_NONE

    def tick(self):
        """Ticks the paddle, moving it if needed.
        """
        if self._vertical == MOVE_DOWN:
            self.move_down()
        elif self._vertical == MOVE_UP:
            self.move_up()

    def reset(self):
        """Resets the paddle's position and ready status.
        """
        self._ready = False
        self._vertical = MOVE_NONE
        self._is_powered_up = False
        self._power = 0
        self._y = (self._y_max + self.y_min) / 2

    def charge_power(self, ball):
        """Transfers the power to the ball if the paddle
        is set as such, gain power otherwise.

        Args:
            ball (Ball): ball to charge up.
        """
        self._power += self._power_per_bounce
        self._power = min(self._power, 100)
        if self._is_powered_up is True:
            ball.activate_power_up(self._power_multiplier + self._power_bonus)
            self._is_powered_up = False

    def boosto(self):
        """Activates the power-up.
        """
        if self._power >= 100:
            self._power = 0
            self._is_powered_up = True

    def bounce_event_right(self, ball):
        """Defines what happens when the ball collides on the right
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """
        ball.bounce_paddle_left(self._y, self._length, self._bounce_bonus)
        self.charge_power(ball)

    def bounce_event_left(self, ball):
        """Defines what happens when the ball collides on the left
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """
        ball.bounce_paddle_right(self._y, self._length, self._bounce_bonus)
        self.charge_power(ball)

    def bounce_event_top(self, ball):
        """Defines what happens when the ball collides on the top
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """
        ball.bounce_horizontal()
        self.charge_power(ball)

    def bounce_event_bottom(self, ball):
        """Defines what happens when the ball collides on the bottom
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """
        ball.bounce_horizontal()
        self.charge_power(ball)

    def input_move(self, data):
        """Parses the input, and acts
        if needed.

        Args:
            data (dict): data to parse.
        """
        if data["move"] == "down":
            if data["method"] == "held":
                self.set_move_down()
            elif data["method"] == "release":
                self.set_move_stop()
            else:
                self.move_down()
        elif data["move"] == "up":
            if data["method"] == "held":
                self.set_move_up()
            elif data["method"] == "release":
                self.set_move_stop()
            else:
                self.move_up()
        elif data["move"] == "boost":
            self.boosto()

    #Setters and getters
    @property
    def id(self):
        """returns the ID of the paddle, corresponding
        to the user.

        Returns:
            int: ID of the paddle.
        """
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def speed(self):
        """returns the speed of the paddle.

        Returns:
            float: speed
        """
        return self._speed

    @speed.setter
    def speed(self, value):
        self._speed = value

    @property
    def y_max(self):
        """Returns the y max reachable by the paddle, corresponding
        to the top of the board.

        Returns:
            int: max y reachable.
        """
        return self._y_max

    @y_max.setter
    def y_max(self, value):
        self._y_max = value

    @property
    def y_min(self):
        """Returns the y min reachable by the paddle, corresponding
        to the bottom of the board.

        Returns:
            int: min y reachable.
        """
        return self.y_min

    @y_min.setter
    def y_min(self, value):
        self.y_min = value

    @property
    def vertical(self):
        """Returns the vertical movement input.

        Returns:
            string: movement descriptor.
        """
        return self._vertical

    @vertical.setter
    def vertical(self, value):
        self._vertical = value

    @property
    def ready(self):
        """Returns the ready state of the paddle.

        Returns:
            bool: `True` if the paddle is ready, `False` otherwise.
        """
        return self._ready

    @ready.setter
    def ready(self, value):
        self._ready = value

    @property
    def power(self):
        """Returns the power of the paddle, needed to
        activate the powerup.

        Returns:
            int: power.
        """
        return self._power

    @power.setter
    def power(self, value):
        self._power = value

    @property
    def power_per_bounce(self):
        """Returns how much power is gained per bounce.

        Returns:
            float: power gained.
        """
        return self._power_per_bounce

    @power_per_bounce.setter
    def power_per_bounce(self, value):
        self._power_per_bounce = value

    @property
    def power_multiplier(self):
        """Returns the power bonus of the paddle.

        Returns:
            float: power bonus.
        """
        return self._power_multiplier

    @power_multiplier.setter
    def power_multiplier(self, value):
        self._power_multiplier = value

    @property
    def is_powered_up(self):
        """Returns wether the paddle is powered up or not.

        Returns:
            bool: `True` if the paddle is powered up, `False` otherwise.
        """
        return self._is_powered_up

    @is_powered_up.setter
    def is_powered_up(self, value):
        self._is_powered_up = value

    @property
    def message_queue(self):
        """Returns the message queue.

        Returns:
            dict: Message queue.
        """
        return self._message_queue

    @message_queue.setter
    def message_queue(self, value):
        self._message_queue = value
