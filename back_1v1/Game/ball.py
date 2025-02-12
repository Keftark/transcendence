"""BALLZ"""

import math
import random
import os

MAX_BOUNCE_ANGLE = math.radians(60)
MAX_SPEED = float(os.environ.get("BALL_SPEED_LIMIT", 8))

class Ball:
    """A ball class that balls around
    """
    def __init__(self, room_id):
        self._x = 0
        self._y = 0
        self._speed = float(os.environ.get("BALL_SPEED_INITIAL", 0.7))
        self._base_speed = self._speed
        self._velocity_x = self._speed if random.random() < 0.5 else self._speed * -1
        self._velocity_y = 0
        self._velocity_boosted_x = 0
        self._velocity_boosted_y = 0
        self._speed_increment = float(os.environ.get("BALL_SPEED_INCREMENT", 1.01))
        self._bounce_angle_max = 75 * math.pi / 180
        self._radius = float(os.environ.get("BALL_RADIUS", 0.7))
        self._is_powered_up = False
        self._power_boost = 1.5
        self._room_id = room_id
        self._message_queue = []
        self._can_bounce = True

    def set_up(self, payload):
        """Loads optionnal parameters.

        Args:
            payload (dict): contains optional parameters.
        """
        for data in payload:
            match data:
                case "base_speed":
                    self._base_speed = (int)(payload[data])
                case "speed_increment":
                    self.speed_increment = (int)(payload[data])
                case "radius":
                    self._radius = (int)(payload[data])

    def reset(self, side):
        """Resets the ball to the center, and gives it 
        a new angle depending on side.

        Args:
            side (bool): wether or not the ball goes to the left side.
        """
        self._x = 0
        self._y = 0
        self._speed = self._base_speed
        self._velocity_x = self._speed if side else self._speed * -1
        self._velocity_y = 0
        self._velocity_boosted_x = self._velocity_x
        self._velocity_boosted_y = 0
        self._is_powered_up = False

    def bounce_vertical(self):
        """Vertical bounce event.
        """
        self._velocity_x *= -1
        self._velocity_boosted_x *= -1
        self._message_queue.append(self.dump_bounce_obstacle())

    def bounce_horizontal(self):
        """Horizontal bounce event.
        """
        self._velocity_y *= -1
        self._velocity_boosted_y *= -1
        self._message_queue.append(self.dump_bounce_obstacle())

    def activate_power_up(self, power = 2):
        """Activates the power up.

        Args:
            power (int, optional): The amount of added power. Defaults to 2.
        """
        self._power_boost = power
        self._is_powered_up = True

    def bounce_paddle(self, y, size, bonus, right = -1):
        """Bounces on the paddle

        Args:
            y (float): center point of the paddle.
            size (int): Size of the paddle.
            bonus (float): Bonus speed multiplier.
            right (int, optional): Modifier for x value. Defaults to -1.
        """
        if self._is_powered_up is True:
            self._is_powered_up = False
        offset = self._y - y
        norm = offset / (size / 2)
        bounce_angle = norm * MAX_BOUNCE_ANGLE
        self._speed *= self._speed_increment
        self.speed = min(self.speed, MAX_SPEED)
        self._velocity_x = (self._speed * bonus) * math.cos(bounce_angle) * right
        self._velocity_y = (self._speed * bonus) * math.sin(bounce_angle)
        self._velocity_boosted_x = (self._speed * bonus) * \
                math.cos(bounce_angle) * self._power_boost * right
        self._velocity_boosted_y = (self._speed * bonus) * \
                math.sin(bounce_angle) * self._power_boost
        self._message_queue.append(self.dump_bounce_player())

    def bounce_paddle_left(self, y, size, bonus):
        """Bounces the ball on the left side of a paddle.

        Args:
            y (float): center point of the paddle.
            size (int): Size of the paddle.
            bonus (float): Bonus speed multiplier.
        """
        self.bounce_paddle(y, size, bonus, 1)

    def bounce_paddle_right(self, y, size, bonus):
        """Bounces the ball on the right side of a paddle.

        Args:
            y (float): center point of the paddle.
            size (int): Size of the paddle.
            bonus (float): Bonus speed multiplier.
        """
        self.bounce_paddle(y, size, bonus, -1)

    def update_position(self):
        """Updates the position of the ball, adding the velocity
        vector to the position vector.
        """
        if self._x < 0:
            if self._is_powered_up is True:
                if self._x + self._velocity_boosted_x > 0:
                    self._can_bounce = True
            else:
                if self._x + self._velocity_x > 0:
                    self._can_bounce = True
        if self._x > 0:
            if self._is_powered_up is True:
                if self._x + self._velocity_boosted_x < 0:
                    self._can_bounce = True
            else:
                if self._x + self._velocity_x < 0:
                    self._can_bounce = True
        if self._is_powered_up is True:
            self._x += self._velocity_boosted_x
            self._y += self._velocity_boosted_y
        else:
            self._x += self._velocity_x
            self._y += self._velocity_y

    def dump_bounce_player(self):
        """Event of a ball colliding on a player.

        Returns:
            dict: dump
        """
        event = {
            "type": "bounce_player",
            "server": "1v1_classic",
            "answer": "yes",
            "room_id": self._room_id,
            "ball_x": self._x,
            "ball_y": self._y,
            "ball_speed": self._speed,
            "ball_boosted": self._is_powered_up
        }
        return event

    def dump_bounce_obstacle(self):
        """Event of a ball colliding on an obstacle.

        Returns:
            dict: dump
        """
        event = {
            "type": "bounce_obstacle",
            "server": "1v1_classic",
            "answer": "yes",
            "room_id": self._room_id,
            "ball_x": self._x,
            "ball_y": self._y,
            "ball_speed": self._speed
        }
        return event

    #Setters and getters
    @property
    def x(self):
        """Current x position of the ball.

        Returns:
            float: x position.
        """
        return self._x

    @x.setter
    def x(self, value):
        self._x = value

    @property
    def y(self):
        """Current y position of the ball.

        Returns:
            float: y position.
        """
        return self._y

    @y.setter
    def y(self, value):
        self._y = value

    @property
    def speed(self):
        """Current speed value of the ball.

        Returns:
            float: speed.
        """
        return self._speed

    @speed.setter
    def speed(self, value):
        self._speed = value

    @property
    def base_speed(self):
        """Returns the base speed value, the value the ball
        will reset to.

        Returns:
            float: base speed.
        """
        return self._base_speed

    @base_speed.setter
    def base_speed(self, value):
        self._base_speed = value

    @property
    def velocity_x(self):
        """Current x velocity of the ball.

        Returns:
            float: x velocity.
        """
        return self._velocity_x

    @velocity_x.setter
    def velocity_x(self, value):
        self._velocity_x = value

    @property
    def velocity_y(self):
        """Current y velocity of the ball.

        Returns:
            float: y velocity.
        """
        return self._velocity_y

    @velocity_y.setter
    def velocity_y(self, value):
        self._velocity_y = value

    @property
    def velocity_boosted_x(self):
        """Current x boosted velocity of the ball.

        Returns:
            float: x boosted velocity.
        """
        return self._velocity_boosted_x

    @velocity_boosted_x.setter
    def velocity_boosted_x(self, value):
        self._velocity_boosted_x = value

    @property
    def velocity_boosted_y(self):
        """Current y boosted velocity of the ball.

        Returns:
            float: y boosted velocity.
        """
        return self._velocity_boosted_y

    @velocity_boosted_y.setter
    def velocity_boosted_y(self, value):
        self._velocity_boosted_y = value

    @property
    def speed_increment(self):
        """Returns the speed multiplier that applies
        to each bounce.

        Returns:
            float: the multiplier.
        """
        return self._speed_increment

    @speed_increment.setter
    def speed_increment(self, value):
        self._speed_increment = value

    @property
    def bounce_angle_max(self):
        """Returns the max bounce angle.

        Returns:
            float: max bounce angle
        """
        return self._bounce_angle_max

    @bounce_angle_max.setter
    def bounce_angle_max(self, value):
        self._bounce_angle_max = value

    @property
    def radius(self):
        """Returns the radius of the ball, ie its width.

        Returns:
            float: radius.
        """
        return self._radius

    @radius.setter
    def radius(self, value):
        self._radius = value

    @property
    def is_powered_up(self):
        """Returns wether the ball is powered up or not.

        Returns:
            bool: _description_
        """
        return self._is_powered_up

    @is_powered_up.setter
    def is_powered_up(self, value):
        self._is_powered_up = value

    @property
    def power_boost(self):
        """Returns the power boost, ie how much the boost adds
        speed to the ball

        Returns:
            float: multiplier
        """
        return self._power_boost

    @power_boost.setter
    def power_boost(self, value):
        self._power_boost = value

    @property
    def message_queue(self):
        """Returns the message queue.

        Returns:
            dict: Message queue
        """
        return self._message_queue

    @message_queue.setter
    def message_queue(self, value):
        self._message_queue = value

    @property
    def can_bounce(self):
        """Returns wether or not the ball can bounce.
        Used to avoid the ball bouncing twice in the same frame.

        Returns:
            bool: be bouncy
        """
        return self._can_bounce

    @can_bounce.setter
    def can_bounce(self, value):
        self._can_bounce = value
