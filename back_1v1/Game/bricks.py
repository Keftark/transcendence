import random
from obstacle import Obstacle

class Brick():
    def __init__(self):
        self._bricks = []

    @property
    def bricks(self):
        return self._bricks

    @bricks.setter
    def bricks(self, value):
        self._bricks = value

    def add_brick(self, obstacle):
        self.bricks.append(obstacle)

    def place(self, x, y):
        for brick in self._bricks:
            brick.x += x
            brick.y += y

    def tick(self):
        for brick in self.bricks:
            if (brick.breakable and brick.life <= 0):
                self._bricks.remove(brick)

    def dump_brick(self):
        dump = ""
        for brick in self._bricks:
            dump += "["
            dump += "x: " + brick.x
            dump += ", y: " + brick.y
            dump += ", color: " + brick.color
            dump += ", life: " + brick.life
            dump += "], "
        return dump

#define a bunch of random bricks

#A sad single little brick
#     o
class Brick_Single(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0xb9111))

#A square
#     oo
#     oo
class Brick_Square(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x8f0000))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x8f0000))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x8f0000))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x8f0000))

#A triangle
#     o
#     oo
#     o
class Brick_Triangle(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 2, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x2618c4))

#Also a triangle
#     o
#    oo
#     o
class Brick_Triangle_Reverse(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 2, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x2618c4))

#Again a triangle
#     o
#    ooo
class Brick_Triangle_Up(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(2, 1, 1, 1, 0x2618c4))

#A triangle with a vengeance
#    ooo
#     o
class Brick_Triangle_Down(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 1, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(0, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x2618c4))
        self.add_brick(Obstacle(2, 0, 1, 1, 0x2618c4))

#A deluxe plus
#     o
#    ooo
#     o
class Brick_Plus(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(1, 0, 1, 1, 0xd4be00))
        self.add_brick(Obstacle(0, 1, 1, 1, 0xd4be00))
        self.add_brick(Obstacle(1, 1, 1, 1, 0xd4be00))
        self.add_brick(Obstacle(2, 1, 1, 1, 0xd4be00))
        self.add_brick(Obstacle(1, 2, 1, 1, 0xd4be00))

#Just another brick in the wall
#     o
#     o
#     o
#     o
class Brick_Wall(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(0, 2, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(0, 3, 1, 1, 0x3bdbe3))

#A platform
#   oooo
class Brick_Platform(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(2, 0, 1, 1, 0x3bdbe3))
        self.add_brick(Obstacle(3, 0, 1, 1, 0x3bdbe3))

#A bracket
#   oo
#   o
#   oo
class Brick_Bracket(Brick):
    def __init__(self):
        super().__init__()
        self.add_brick(Obstacle(0, 0, 1, 1, 0x722791))
        self.add_brick(Obstacle(1, 0, 1, 1, 0x722791))
        self.add_brick(Obstacle(0, 1, 1, 1, 0x722791))
        self.add_brick(Obstacle(0, 2, 1, 1, 0x722791))
        self.add_brick(Obstacle(1, 2, 1, 1, 0x722791))

#A bracket but reversed
#   oo
#    o
#   oo
class Brick_Bracket_Reverse(Brick):
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
        rng = random.randint(0, 10)
        if rng == 0:
            return Brick_Single()
        if rng == 1:
            return Brick_Square()
        if rng == 2:
            return Brick_Triangle()
        if rng == 3:
            return Brick_Triangle_Reverse()
        if rng == 4:
            return Brick_Triangle_Up()
        if rng == 5:
            return Brick_Triangle_Down()
        if rng == 6:
            return Brick_Plus()
        if rng == 7:
            return Brick_Wall()
        if rng == 8:
            return Brick_Platform()
        if rng == 9:
            return Brick_Bracket()
        if rng == 10:
            return Brick_Bracket_Reverse()
