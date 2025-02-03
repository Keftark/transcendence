""""Paddle"""

PRECISION = 5
DEFAULT_SPEED = 0.75
MOVE_UP    = 1
MOVE_DOWN  = -1
MOVE_NONE = 0

class Paddle:
    """A paddle, the player character.
    """
    def __init__(self, _id, x, _len, board_top_y, board_bottom_y):
        self._id = _id
        self._x = x
        self._y = 0
        self._width = 0.5
        self._length = _len
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
                    self._length = (int)(payload[data])
                case "power":
                    self._power_bonus = (int)(payload[data])
                case "speed":
                    self._speed_bonus = (int)(payload[data])
                case "bounce":
                    self._bounce_bonus = (int)(payload[data])

    def upper_bound(self):
        """Returns the upper bound of the paddle.

        Returns:
            float: upper y of the paddle.
        """
        return self._y + self.length / 2

    def upper_collision(self, ball):
        """Check wether the ball is colliding with the upper 
        part of the paddle or not.

        Args:
            ball (Ball): A ball.

        Returns:
            bool: `True` if the ball collides, `False` otherwise.
        """
        current_y = ball.y
        next_y = ball.y + ball.velocity_y if ball.is_powered_up is False \
                else ball.velocity_boosted_y
        if current_y > next_y:
            current_y, next_y = next_y, current_y
        for i in range((int)(current_y * PRECISION), (int)(next_y * PRECISION), 1):
            if (i / PRECISION >= self.upper_bound()
                and i / PRECISION <= self.upper_bound() + self._width):
                return True
        return False

    def lower_bound(self):
        """Returns the lower bound of the paddle.

        Returns:
            float: lower y of the paddle.
        """
        return self._y - self.length / 2

    def lower_collision(self, ball):
        """Check wether the ball is colliding with the lower 
        part of the paddle or not.

        Args:
            ball (Ball): A ball.

        Returns:
            bool: `True` if the ball collides, `False` otherwise.
        """
        current_y = ball.y
        next_y = ball.y + ball.velocity_y if ball.is_powered_up is False \
                else ball.velocity_boosted_y
        if current_y > next_y:
            current_y, next_y = next_y, current_y
        for i in range((int)(current_y * PRECISION), (int)(next_y * PRECISION), 1):
            if (i / PRECISION <= self.lower_bound()
                and i / PRECISION >= self.lower_bound() - self._width):
                return True
        return False

    def right_bound(self):
        """Returns the right bound of the paddle.

        Returns:
            float: right x of the paddle.
        """
        return self._x + self._width

    def right_collision(self, ball):
        """Check wether the ball is colliding with the right 
        part of the paddle or not.

        Args:
            ball (Ball): A ball.

        Returns:
            bool: `True` if the ball collides, `False` otherwise.
        """
        current_x = ball.x
        next_x = ball.x + ball.velocity_x if ball.is_powered_up is False \
                else ball.velocity_boosted_x
        if current_x > next_x:
            current_x, next_x = next_x, current_x
        for i in range((int)(current_x * PRECISION), (int)(next_x * PRECISION), 1):
            if (i / PRECISION >= self.right_bound()
                and i / PRECISION <= self.right_bound() + self._width):
                return True
        return False

    def left_bound(self):
        """Returns the left bound of the paddle.

        Returns:
            float: left x of the paddle.
        """
        return self._x

    def left_collision(self, ball):
        """Check wether the ball is colliding with the left 
        part of the paddle or not.

        Args:
            ball (Ball): A ball.

        Returns:
            bool: `True` if the ball collides, `False` otherwise.
        """
        current_x = ball.x
        next_x = ball.x + ball.velocity_x if ball.is_powered_up is False \
                else ball.velocity_boosted_x
        if current_x > next_x:
            current_x, next_x = next_x, current_x
        for i in range((int)(current_x * PRECISION), (int)(next_x * PRECISION), 1):
            if (i / PRECISION <= self.left_bound()
                and i / PRECISION >= self.left_bound() - self._width):
                return True
        return False

    def move_up(self):
        """Displaces the paddle up.
        """
        if self.upper_bound() < self._y_max:
            self.y += self._speed + self._speed_bonus

    def move_down(self):
        """Displaces the paddle down.
        """
        if self.lower_bound() > self._y_min:
            self.y -= self._speed + self._speed_bonus

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
        self._y = 0

    def charge_power(self, ball):
        """Transfers the power to the ball if the paddle
        is set as such, gain power otherwise.

        Args:
            ball (Ball): ball to charge up.
        """
        self._power += self._power_per_bounce
        if self._power > 100:
            self._power = 100
        if self._is_powered_up is True:
            self._is_powered_up = False
            ball.activate_power_up(self._power_multiplier + self._power_bonus)

    def boosto(self):
        """Activates the power-up.
        """
        if self._power >= 100:
            self._power = 0
            self._is_powered_up = True

    #checks if the ball is colliding with the paddle.
    def collide(self, ball):
        """Checks wether the paddle collides with the ball or not.

        Args:
            ball (Ball): The colliding ball.
        """
        if self.right_collision(ball): #right side collision
            for y in range((int)(self.lower_bound() * PRECISION),
                           (int)(self.upper_bound() * PRECISION), 1):
                y_pos = y / PRECISION
                if ball.is_colliding(self.right_bound(), y_pos):
                    ball.bounce_paddle_left(self._y, self._length, self._bounce_bonus)
                    self.charge_power(ball)
                    break
        elif self.left_collision(ball): #left side collision
            for y in range((int)(self.lower_bound() * PRECISION),
                           (int)(self.upper_bound() * PRECISION), 1):
                y_pos = y / PRECISION
                if ball.is_colliding(self.left_bound(), y_pos):
                    ball.bounce_paddle_right(self._y, self._length, self._bounce_bonus)
                    self.charge_power(ball)
                    break
        elif self.upper_collision(ball): #top collision
            for x in range((int)(self.left_bound() * PRECISION),
                           (int)(self.right_bound() * PRECISION), 1):
                x_pos = x / PRECISION
                if ball.is_colliding(x_pos, self.upper_bound()):
                    ball.bounce_horizontal()
                    self.charge_power(ball)
                    break
        elif self.lower_collision(ball): #bottom collision
            for x in range((int)(self.left_bound() * PRECISION),
                           (int)(self.right_bound() * PRECISION), 1):
                x_pos = x / PRECISION
                if ball.is_colliding(x_pos, self.lower_bound()):
                    ball.bounce_horizontal()
                    self.charge_power(ball)
                    break

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
    def x(self):
        """Returns the x position of the paddle's center.

        Returns:
            float: x position of the center.
        """
        return self._x

    @x.setter
    def x(self, value):
        self._x = value

    @property
    def y(self):
        """Returns the y position of the paddle's center.

        Returns:
            float: y position of the center.
        """
        return self._y

    @y.setter
    def y(self, value):
        self._y = value

    @property
    def width(self):
        """Returns the width of the paddle.

        Returns:
            int: width of the paddle.
        """
        return self._width

    @width.setter
    def width(self, value):
        self._width = value

    @property
    def length(self):
        """Returns the length of the paddle.

        Returns:
            float: lenght of the paddle.
        """
        return self._length

    @length.setter
    def length(self, value):
        self._length = value

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
