"""BRICKS"""

import random
from obstacle import Obstacle

class Brick():
    """A simple abstract brick.
    """
    def __init__(self):
        self._bricks = []

    @property
    def bricks(self):
        """Returns the brick list of the brick.

        Returns:
            dict: brick list.
        """
        return self._bricks

    @bricks.setter
    def bricks(self, value):
        self._bricks = value

    def add_brick(self, obstacle):
        """Adds a brick to the list.

        Args:
            obstacle (Obstacle): the brick ot add.
        """
        self.bricks.append(obstacle)

    def place(self, x, y):
        """Place a brick at x;y, this position
        being the upper left position.

        Args:
            x (_type_): _description_
            y (_type_): _description_
        """
        for brick in self._bricks:
            brick.x += x
            brick.y += y

    def tick(self):
        """Checks all brick. If a brick life is equal 
        or below 0, it gets deleted, unless it is unbreakable.
        """
        for brick in self.bricks:
            if brick.breakable and brick.life <= 0:
                self._bricks.remove(brick)

    def dump_brick(self):
        """Dumps all the bricks data in the brick.

        Returns:
            dict: dump of the data
        """
        dump = []
        for brick in self._bricks:
            data = {
                "x": brick.x,
                "y": brick.y,
                "color": brick.color,
                "life": brick.life
            }
            dump.append(data)
        return dump

#define a bunch of random bricks

class BrickSingle(Brick):
    """A sad single little brick
    #     o
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0xb9111))

class BrickSquare(Brick):
    """A square
    #     oo
    #     oo
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x8f0000))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x8f0000))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x8f0000))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x8f0000))

class BrickTriangle(Brick):
    """A triangle
    #     o
    #     oo
    #     o
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 2, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x2618c4))

class BrickTriangleUnbreak(Brick):
    """A triangle but unbreakable
    #     o
    #     oo
    #     o
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, -1, 0x666666))
        self.add_brick(Obstacle(0, 1, 1, -1, 0x666666))
        self.add_brick(Obstacle(0, 2, 1, -1, 0x666666))
        self.add_brick(Obstacle(1, 1, 1, -1, 0x666666))

class BrickTriangleReverse(Brick):
    """Also a triangle
    #     o
    #    oo
    #     o
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 2, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x2618c4))

class BrickTriangleReverseUnbreak(Brick):
    """Also a triangle but you can't touch this
    #     o
    #    oo
    #     o
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 0, 1, -1, 0x666666))
        self.add_brick(Obstacle(1, 1, 1, -1, 0x666666))
        self.add_brick(Obstacle(1, 2, 1, -1, 0x666666))
        self.add_brick(Obstacle(0, 1, 1, -1, 0x666666))

class BrickTriangleUp(Brick):
    """Again a triangle
    #     o
    #    ooo
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(2, 1, 1, 1, 0x2618c4))

class BrickTriangleDown(Brick):
    """A triangle with a vengeance
    #    ooo
    #     o
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(2, 0, 1, 1, 0x2618c4))

class BrickPlus(Brick):
    """A deluxe plus
    #     o
    #    ooo
    #     o
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 0, 1, 1, 0xd4be00))
        self.add_brick(Obstacle(0, 1, 1, 1, 0xd4be00))
        self.add_brick(Obstacle(1, 1, 1, 1, 0xd4be00))
        self.add_brick(Obstacle(2, 1, 1, 1, 0xd4be00))
        self.add_brick(Obstacle(1, 2, 1, 1, 0xd4be00))

class BrickWall(Brick):
    """Just another brick in the wall
    #     o
    #     o
    #     o
    #     o
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(0, 2, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(0, 3, 1, 1, 0x3bdbe3))

class BrickPlatform(Brick):
    """A platform
    #   oooo
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(2, 0, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(3, 0, 1, 1, 0x3bdbe3))

class BrickBracket(Brick):
    """A bracket
    #   oo
    #   o
    #   oo
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x722791))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x722791))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x722791))
        self.add_brick(Obstacle(0, 2, 1, 1, 0x722791))
        self.add_brick(Obstacle(1, 2, 1, 1, 0x722791))

class BrickBracketReverse(Brick):
    """A bracket but reversed
    #   oo
    #    o
    #   oo 
    """
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x722791))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x722791))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x722791))
        self.add_brick(Obstacle(1, 2, 1, 1, 0x722791))
        self.add_brick(Obstacle(0, 2, 1, 1, 0x722791))

class BrickGenerator():
    """A singleton brick generator.
    """
    def __init__(self):
        self.__class__.__new__ = lambda _: self
        self.__class__.__init__ = lambda *_, **__: None

    def generate(self):
        """Generates and return a random brick.

        Returns:
            Brick: a brick.
        """
        value = None
        rng = random.randint(0, 10)
        if rng == 0:
            value = BrickSingle()
        elif rng == 1:
            value = BrickSquare()
        elif rng == 2:
            value = BrickTriangle()
        elif rng == 3:
            value = BrickTriangleReverse()
        elif rng == 4:
            value = BrickTriangleUp()
        elif rng == 5:
            value = BrickTriangleDown()
        elif rng == 6:
            value = BrickPlus()
        elif rng == 7:
            value = BrickWall()
        elif rng == 8:
            value = BrickPlatform()
        elif rng == 9:
            value = BrickBracket()
        elif rng == 10:
            value = BrickBracketReverse()
        return value
