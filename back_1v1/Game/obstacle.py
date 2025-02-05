"""OBSTACLE"""

from Game.bouncable import Bouncable

PRECISION = 10

class Obstacle(Bouncable):
    """Defines an obstacle.
    An obstacle can bounce a ball, and be
    destroyed if needed.
    """
    def __init__(self, x, y, size, life = -1, color = 0x000000):
        super().__init__(x, y, size, size)
        self._life = life
        self._color = color
        self._breakable = life > 0

    def bounce_event_top(self, ball):
        """Defines what happens when the ball collides on the top
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """
        ball.bounce_horizontal()
        if self.life > 0:
            self._life -= 1

    def bounce_event_bottom(self, ball):
        """Defines what happens when the ball collides on the bottom
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """
        ball.bounce_horizontal()
        if self.life > 0:
            self._life -= 1

    def bounce_event_right(self, ball):
        """Defines what happens when the ball collides on the right
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """
        ball.bounce_vertical()
        if self.life > 0:
            self._life -= 1

    def bounce_event_left(self, ball):
        """Defines what happens when the ball collides on the left
        part of the bouncable.

        Args:
            ball (Ball): Ball to bounce.
        """
        ball.bounce_vertical()
        if self.life > 0:
            self._life -= 1

    #getters and setters

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
