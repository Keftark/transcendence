"""OBSTACLE"""

PRECISION = 10

class Obstacle():
    """Defines an obstacle.
    An obstacle can bounce a ball, and be
    destroyed if needed.
    """
    def __init__(self, x, y, size, life = -1, color = 0x000000):
        self._x = x
        self._y = y
        self._size = size
        self._life = life
        self._color = color
        self._breakable = life > 0

    def upper_bound(self):
        """Returns the upper bound of the obstacle.

        Returns:
            float: y of the upper bound.
        """
        return self._y

    def upper_collision(self, ball):
        """Checks the upper side collision of the obstacle.

        Args:
            ball (Ball): the ball.

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
                and i / PRECISION <= self.upper_bound() + self._size):
                return True
        return False

    def lower_bound(self):
        """Returns the lower bound of the obstacle.

        Returns:
            float: y of the lowe bound.
        """
        return self._y - self._size

    def lower_collision(self, ball):
        """Checks the lower side collision of the obstacle.

        Args:
            ball (Ball): the ball.

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
                and i / PRECISION >= self.lower_bound() - self._size):
                return True
        return False

    def right_bound(self):
        """Returns the right bound of the obstacle.

        Returns:
            float: x of the right bound.
        """
        return self._x + self._size

    def right_collision(self, ball):
        """Checks the right side collision of the obstacle.

        Args:
            ball (Ball): the ball.

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
                and i / PRECISION <= self.right_bound() + self._size):
                return True
        return False

    def left_bound(self):
        """Returns the left bound of the obstacle.

        Returns:
            float: x of the left bound.
        """
        return self._x

    def left_collision(self, ball):
        """Checks the left side collision of the obstacle.

        Args:
            ball (Ball): the ball.

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
                and i / PRECISION >= self.left_bound() - self._size):
                return True
        return False

    def collide(self, ball, hurts = False):
        """checks if the ball is colliding with the obstacle. If hurts is
        set to true, remove one life from the obstacle.

        Args:
            ball (Ball): The ball.
            hurts (bool, optional): Wether or not the bounce should
            remove life from the obstacle. Defaults to False.
        """
        if self.right_collision(ball): #right side collision
            for y in range((int)(self.lower_bound() * PRECISION),
                           (int)(self.upper_bound() * PRECISION), 1):
                y_pos = y / PRECISION
                if ball.is_colliding(self.right_bound(), y_pos):
                    ball.bounce_vertical()
                    if hurts is True:
                        self._life -= 1
                    break
        elif self.left_collision(ball): #left side collision
            for y in range((int)(self.lower_bound() * PRECISION),
                           (int)(self.upper_bound() * PRECISION), 1):
                y_pos = y / PRECISION
                if ball.is_colliding(self.left_bound(), y_pos):
                    ball.bounce_vertical()
                    if hurts is True:
                        self._life -= 1
                    break
        elif self.upper_collision(ball): #top collision
            for x in range((int)(self.left_bound() * PRECISION),
                           (int)(self.right_bound() * PRECISION), 1):
                x_pos = x / PRECISION
                if ball.is_colliding(x_pos, self.upper_bound()):
                    ball.bounce_horizontal()
                    if hurts is True:
                        self._life -= 1
                    break
        elif self.lower_collision(ball): #bottom collision
            for x in range((int)(self.left_bound() * PRECISION),
                           (int)(self.right_bound() * PRECISION), 1):
                x_pos = x / PRECISION
                if ball.is_colliding(x_pos, self.lower_bound()):
                    ball.bounce_horizontal()
                    if hurts is True:
                        self._life -= 1
                    break

    #getters and setters
    @property
    def x(self):
        """Returns the upper left x position of the obstacle.

        Returns:
            float: x position.
        """
        return self._x

    @x.setter
    def x(self, value):
        self._x = value

    @property
    def y(self):
        """Returns the upper left y position of the obstacle.

        Returns:
            float: y position.
        """
        return self._y

    @y.setter
    def y(self, value):
        self._y = value

    @property
    def size(self):
        """Returns the size of the obstacle.

        Returns:
            int: size of the obstacle. Defaults to 1.
        """
        return self._size

    @size.setter
    def size(self, value):
        self._size = value

    @property
    def life(self):
        """Returns the hit points of the obstacle.

        Returns:
            int: the life of the obstacle.
        """
        return self._life

    @life.setter
    def life(self, value):
        self._life = value

    @property
    def color(self):
        """Returns the color of the obstacle.
        
        Returns:
            int: hexadecimal color value.
        """
        return self._color

    @color.setter
    def color(self, value):
        self._color = value

    @property
    def breakable(self):
        """Returns wether or not the obstacle is breakable.

        Returns:
            bool: `True` if the obstacle is breakable, `False` otherwise.
        """
        return self._breakable

    @breakable.setter
    def breakable(self, value):
        self._breakable = value
