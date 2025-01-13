from Game import Ball

PRECISION = 15
DEFAULT_SPEED = 0.75
MOVE_UP    = 1
MOVE_DOWN  = -1
MOVE_NONE = 0

class Paddle:
    def __init__(self, id, x, len, board_top_y, board_bottom_y):
        self._id = id
        self._x = x
        self._y = 0
        self._width = 0.5
        self._length = len
        self._speed = DEFAULT_SPEED
        self._y_max = board_top_y
        self._y_min = board_bottom_y
        self._vertical = MOVE_NONE
        self._ready = False
        self._power = 0
        self._power_per_bounce = 25
        self._power_multiplier = 2
        self._is_powered_up = False
        #Event list
        self._message_queue = []
        #Player stats
        self._speed_bonus = 0
        self._power_bonus = 0
        self._bounce_bonus = 1
    
    def set_up(self, payload):
        for data in payload:
            match data:
                case "length":
                    self._length = (int)(payload[data])
                case "power":
                    self._power_bonus = (int)(payload[data])
                case "speed":
                    self._speed_bonus = (int)(payload[data])
                case "bounce":
                    self._bounce_bonus = (int)(payload[data])

    def upper_bound(self):
        return (self._y + self.length / 2)
    
    def upper_collision(self, ball):
        current_y = ball.y
        next_y = ball.y + ball.velocity_y if ball.is_powered_up is False else ball.velocity_boosted_y
        if current_y > next_y:
            current_y, next_y = next_y, current_y
        for i in range((int)(current_y * PRECISION), (int)(next_y * PRECISION), 1):
            if (i / PRECISION >= self.upper_bound() and i / PRECISION <= self.upper_bound() + self._width):
                return True
        return False

    def lower_bound(self):
        return (self._y - self.length / 2)
    
    def lower_collision(self, ball):
        current_y = ball.y
        next_y = ball.y + ball.velocity_y if ball.is_powered_up is False else ball.velocity_boosted_y
        if current_y > next_y:
            current_y, next_y = next_y, current_y
        for i in range((int)(current_y * PRECISION), (int)(next_y * PRECISION), 1):
            if (i / PRECISION <= self.lower_bound() and i / PRECISION >= self.lower_bound() - self._width):
                return True
        return False
    
    def right_bound(self):
        return (self._x + self._width)
    
    def right_collision(self, ball):
        current_x = ball.x
        next_x = ball.x + ball.velocity_x if ball.is_powered_up is False else ball.velocity_boosted_x
        if current_x > next_x:
            current_x, next_x = next_x, current_x
        for i in range((int)(current_x * PRECISION), (int)(next_x * PRECISION), 1):
            if (i / PRECISION >= self.right_bound() and i / PRECISION <= self.right_bound() + self._width):
                return True
        return False
    
    def left_bound(self):
        return (self._x)
    
    def left_collision(self, ball):
        current_x = ball.x
        next_x = ball.x + ball.velocity_x if ball.is_powered_up is False else ball.velocity_boosted_x
        if current_x > next_x:
            current_x, next_x = next_x, current_x
        for i in range((int)(current_x * PRECISION), (int)(next_x * PRECISION), 1):
            if (i / PRECISION <= self.left_bound() and i / PRECISION >= self.left_bound() - self._width):
                return True
        return False
    
    def move_up(self):
        if (self.upper_bound() < self._y_max):
            self.y += self._speed + self._speed_bonus
    
    def move_down(self):
        if (self.lower_bound() > self._y_min):
            self.y -= self._speed + self._speed_bonus

    def set_move_up(self):
        self._vertical = MOVE_UP

    def set_move_down(self):
        self._vertical = MOVE_DOWN

    def set_move_stop(self):
        self._vertical = MOVE_NONE

    def tick(self):
        if self._vertical == MOVE_DOWN:
            self.move_down()
        elif self._vertical == MOVE_UP:
            self.move_up()

    def reset(self):
        self._ready = False 
        self._vertical = MOVE_NONE
        self._y = 0

    def charge_power(self, ball):
        self._power += self._power_per_bounce
        if self._power > 100:
            self._power = 100
        if self._is_powered_up is True:
            self._is_powered_up = False
            ball.activate_power_up(self._power_multiplier + self._power_bonus)

    def boosto(self):
        if (self._power >= 100):
            self._power = 0
            self._is_powered_up = True
    
    #checks if the ball is colliding with the paddle.
    def collide(self, ball):
        if self.right_collision(ball): #right side collision
            for y in range((int)(self.lower_bound() * PRECISION), (int)(self.upper_bound() * PRECISION), 1):
                y_pos = y / PRECISION
                if ball.is_colliding(self.right_bound(), y_pos):
                    ball.bounce_paddle_left(self._y, self._length, self._bounce_bonus)
                    self.charge_power(ball)
                    break
        elif self.left_collision(ball): #left side collision
            for y in range((int)(self.lower_bound() * PRECISION), (int)(self.upper_bound() * PRECISION), 1):
                y_pos = y / PRECISION
                if ball.is_colliding(self.left_bound(), y_pos):
                    ball.bounce_paddle_right(self._y, self._length, self._bounce_bonus)
                    self.charge_power(ball)
                    break
        elif self.upper_collision(ball): #top collision
            for x in range((int)(self.left_bound() * PRECISION), (int)(self.right_bound() * PRECISION), 1):
                x_pos = x / PRECISION
                if ball.is_colliding(x_pos, self.upper_bound()):
                    ball.bounce_horizontal()
                    self.charge_power(ball)
                    break 
        elif self.lower_collision(ball): #bottom collision
            for x in range((int)(self.left_bound() * PRECISION), (int)(self.right_bound() * PRECISION), 1):
                x_pos = x / PRECISION
                if ball.is_colliding(x_pos, self.lower_bound()):
                    ball.bounce_horizontal()
                    self.charge_power(ball)
                    break

    def input_move(self, input):
        if (input["move"] == "down"):
            if (input["method"] == "held"):
                self.set_move_down()
            elif (input["method"] == "release"):
                self.set_move_stop()
            else:
                self.move_down()
        elif (input["move"] == "up"):
            if (input["method"] == "held"):
                self.set_move_up()
            elif (input["method"] == "release"):
                self.set_move_stop()
            else:
                self.move_up()
        elif (input["move"] == "boost"):
            self.boosto()

    #Setters and getters
    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

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
    def width(self):
        return self._width

    @width.setter
    def width(self, value):
        self._width = value

    @property
    def length(self):
        return self._length

    @length.setter
    def length(self, value):
        self._length = value

    @property
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, value):
        self._speed = value
    
    @property
    def y_max(self):
        return self._y_max

    @y_max.setter
    def y_max(self, value):
        self._y_max = value

    @property
    def y_min(self):
        return self.y_min

    @y_max.setter
    def y_min(self, value):
        self.y_min = value

    @property
    def vertical(self):
        return self._vertical

    @vertical.setter
    def vertical(self, value):
        self._vertical = value

    @property
    def horizont(self):
        return self._horizont

    @horizont.setter
    def horizont(self, value):
        self._horizont = value

    @property
    def ready(self):
        return self._ready

    @ready.setter
    def ready(self, value):
        self._ready = value

    @property
    def power(self):
        return self._power

    @power.setter
    def power(self, value):
        self._power = value

    @property
    def power_per_bounce(self):
        return self._power_per_bounce

    @power_per_bounce.setter
    def power_per_bounce(self, value):
        self._power_per_bounce = value

    @property
    def power_multiplier(self):
        return self._power_multiplier

    @power_multiplier.setter
    def power_multiplier(self, value):
        self._power_multiplier = value

    @property
    def is_powered_up(self):
        return self._is_powered_up

    @is_powered_up.setter
    def is_powered_up(self, value):
        self._is_powered_up = value

    @property
    def message_queue(self):
        return self._message_queue

    @message_queue.setter
    def message_queue(self, value):
        self._message_queue = value
