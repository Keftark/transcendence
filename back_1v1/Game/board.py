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

    def generate_brick_list(self):
        """Generates a dump that contains the list of bricks.

        Returns:
            dict: the dumpy
        """
        dump = []
        for brick in self._bricks:
            dump.append(brick.dump_brick())
        return dump

    def can_place(self, brick, x, y):
        """Checks wether a brick or not can be placed
        at the x;y position."""
        if brick:
            return True
        return False

    def place(self, brick, x, y):
        """Place a brick within the game board at the x;y positions.

        Args:
            brick (Brick): a brick to place.
            x (int) : x position of the brick.
            y (int) : y position of the brick.
        """
        if self.can_place(brick, x, y):
            brick.place(x, y)
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

    @property
    def bricks(self):
        """Returns the upper y bound (up side).

        Returns:
            float: up side y
        """
        return self._bricks

    @bricks.setter
    def bricks(self, value):
        self._bricks = value
