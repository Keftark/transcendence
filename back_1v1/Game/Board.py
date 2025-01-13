class Board:
    def __init__(self, height, width):
        self._min_x = -width
        self._max_x = width
        self._min_y = -height
        self._max_y = height
        self._bricks = []

    def is_in_board(self, x, y):
        if (x > self._max_x or x < self.min_x):
            return False
        elif (y > self._max_y or y < self.min_y):
            return False
        return True

    #TODO: check if the brick can be placed (inside the bounds, doesn't overwrite)
    def can_place(self, brick):
        pass

    #TODO: place a brick
    def place(self, brick):
        pass
    
    @property
    def min_x(self):
        return self._min_x

    @min_x.setter
    def min_x(self, value):
        self._min_x = value

    @property
    def max_x(self):
        return self._max_x

    @max_x.setter
    def max_x(self, value):
        self._max_x = value

    @property
    def min_y(self):
        return self._min_y

    @min_y.setter
    def min_y(self, value):
        self._min_y = value

    @property
    def max_y(self):
        return self._max_y

    @max_y.setter
    def max_y(self, value):
        self._max_y = value


    