"""Bouncable class file"""

PRECISION = 5

class Bouncable():
    """A bouncable is a physical object that does not move
    and will instead bounce a ball upon contact.
    """
    def __init__(self, x, y, w, le):
        self._x = x
        self._y = y
        self._width = w
        self._length = le

    def bounds(self):
        """Returns the bounds of the Bouncable as (left, right, top, bottom)."""
        half_w = self._width / 2
        half_l = self._length / 2
        return self._x - half_w, self._x + half_w, self._y + half_l, self._y - half_l

    def lower_bound(self):
        """Returns the lower bound of the Bouncable.
        """
        return self.bounds()[3]

    def upper_bound(self):
        """Returns the upper bound of the Bouncable.
        """
        return self.bounds()[2]

    def bounce_event_top(self, ball):
        """Defines what happens when the ball collides on the top
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """

    def bounce_event_bottom(self, ball):
        """Defines what happens when the ball collides on the bottom
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """

    def bounce_event_left(self, ball):
        """Defines what happens when the ball collides on the left
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """

    def bounce_event_right(self, ball):
        """Defines what happens when the ball collides on the right
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """

    def collide(self, ball):
        """Checks wether the bouncable collides with the ball or not.

        Args:
            ball (Ball): The colliding ball.
        """

        left, right, top, bottom = self.bounds()
        if ball.is_powered_up:
            steps = int(max(abs(ball.velocity_boosted_x),
                            abs(ball.velocity_boosted_y)) / ball.radius) + 1
            step_x = ball.velocity_boosted_x / steps
            step_y = ball.velocity_boosted_y / steps
        else:
            steps = int(max(abs(ball.velocity_x), abs(ball.velocity_y)) / ball.radius) + 1
            step_x = ball.velocity_x / steps
            step_y = ball.velocity_y / steps

        for step in range(steps):
            next_x = ball.x + step_x * step
            next_y = ball.y + step_y * step

            if next_x + ball.radius > left and next_x - ball.radius < right and \
            next_y + ball.radius > bottom and next_y - ball.radius < top:
                if ball.x < left <= next_x + ball.radius:
                    self.bounce_event_left(ball)
                elif ball.x > right >= next_x - ball.radius:
                    self.bounce_event_right(ball)
                elif ball.y > top >= next_y - ball.radius:
                    self.bounce_event_top(ball)
                elif ball.y < bottom <= next_y + ball.radius:
                    self.bounce_event_bottom(ball)

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
