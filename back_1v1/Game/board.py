"""Board"""

class Board:
    """A game board. Contains size and bricks.
    """
    def __init__(self, height, width):
        self._min_x = -width
        self._max_x = width
        self._min_y = -height
        self._max_y = height
        self._bricks = []

    def is_in_board(self, x, y):
        """Checks wether the x;y position is within the game
        board.

        Args:
            x (float): x position
            y (float): y position

        Returns:
            bool: `True` if the position is within the board, `False` otherwise
        """
        if x > self._max_x or x < self.min_x:
            return False
        if y > self._max_y or y < self.min_y:
            return False
        return True

    def can_place(self, brick):
        pass

    @DeprecationWarning
    def place(self, brick):
        """Place a brick within the game board. unused.

        Args:
            brick (Brick): a brick to place.
        """
        if self.can_place(brick):
            self._bricks.append(brick)

    @property
    def min_x(self):
        """Returns the lower x bound (left side).

        Returns:
            float: left side x
        """
        return self._min_x

    @min_x.setter
    def min_x(self, value):
        self._min_x = value

    @property
    def max_x(self):
        """Returns the upper x bound (right side).

        Returns:
            float: right side x
        """
        return self._max_x

    @max_x.setter
    def max_x(self, value):
        self._max_x = value

    @property
    def min_y(self):
        """Returns the lower y bound (low side).

        Returns:
            float: low side y
        """
        return self._min_y

    @min_y.setter
    def min_y(self, value):
        self._min_y = value

    @property
    def max_y(self):
        """Returns the upper y bound (up side).

        Returns:
            float: up side y
        """
        return self._max_y

    @max_y.setter
    def max_y(self, value):
        self._max_y = value
