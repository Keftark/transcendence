from Game import Ball

PRECISION = 0.1

class Obstacle:
    #define a square obstacle. 
    def __init__(self, x, y, size, life = -1, color = 0x000000):
        self._x = x 
        self._y = y
        self._size = size
        self._life = life
        self._color = color
        self._breakable = True

    def top_left(self):
        return {"x": self._x, "y": self._y}
    
    def top_right(self):
        return {"x": self._x + self.size, "y": self._y}
    
    def bottom_left(self):
        return {"x": self._x, "y": self._y - self.size}
    
    def bottom_right(self):
        return {"x": self._x + self.size, "y": self._y - self.size}
    
    #checks if the ball is colliding with the obstacle. If hurts is
    #set to true, remove one life from the obstacle. 
    def collide(self, ball, hurts = False):
        if ball.y >= self._y: #top collision
            for x in range(self._x, self._x + self._size, PRECISION):
                if ball.is_colliding(x, self._y):
                    ball.bounce_horizontal()
                    if (hurts):
                        self._life -= 1
                    break 
        elif ball.y <= (self._y - self._size): #bottom collision
            for x in range(self._x, self._x + self._size, PRECISION):
                if ball.is_colliding(x, (self._y - self._size)):
                    ball.bounce_horizontal()
                    if (hurts):
                        self._life -= 1
                    break
        elif ball.x <= self._x: #right side collision
            for y in range(self._y, self._y + self._size, PRECISION):
                if ball.is_colliding(self._x, y):
                    ball.bounce_vertical()
                    if (hurts):
                        self._life -= 1
                    break
        elif ball.x <= (self._x + self._size): #left side collision
            for y in range(self._y, self._y + self._size, PRECISION):
                if ball.is_colliding((self._x + self._size), y):
                    ball.bounce_vertical()
                    if (hurts):
                        self._life -= 1
                    break

    #getters and setters
    @property
    def x(self):
        return self._x

    @x.setter
    def x(self, value):
        self._x = value

    @property
    def y(self):
        return self._y

    @y.setter
    def y(self, value):
        self._y = value

    @property
    def size(self):
        return self._size

    @size.setter
    def size(self, value):
        self._size = value

    @property
    def life(self):
        return self._life

    @life.setter
    def life(self, value):
        self._life = value

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, value):
        self._color = value

    @property
    def breakable(self):
        return self._breakable

    @breakable.setter
    def breakable(self, value):
        self._breakable = value
