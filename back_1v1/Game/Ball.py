import math
import random

MAX_BOUNCE_ANGLE = math.radians(60) 
PRECISION = 10

class Ball:
    def __init__(self, room_id):
        self._x = 0
        self._y = 0
        self._speed = 0.7
        self._base_speed = self._speed
        self._velocity_x = self._speed if random.random() < 0.5 else self._speed * -1
        self._velocity_y = 0
        self._velocity_boosted_x = 0
        self._velocity_boosted_y = 0
        self._speed_increment = 1.01
        self._bounce_angle_max = 75 * math.pi / 180
        self._radius = 0.7
        self._bounces = 0
        self._is_powered_up = False
        self._power_boost = 1.5
        self._room_id = room_id
        self._message_queue = []

    def load_parameters(self, radius, base_speed, speed_increment):
        self._x = 0
        self._y = 0
        self._speed = base_speed
        self._base_speed = self._speed
        self._velocity_x = self._speed if random.random() < 0.5 else self._speed * -1
        self._velocity_y = 0
        self._velocity_boosted_x = 0
        self._velocity_boosted_y = 0
        self._speed_increment = speed_increment
        self._bounce_angle_max = 75 * math.pi / 180
        self._radius = radius

    def reset(self, side):
        self._x = 0
        self._y = 0
        self._speed = self._base_speed
        self._velocity_x = self._speed if side else self._speed * -1
        self._velocity_boosted_x = 0
        self._velocity_boosted_y = 0
        self._velocity_y = 0 
        self._bounces = 0
        self._is_powered_up = False
    
    def bounce_vertical(self):
        self._velocity_x *= -1
        self._velocity_boosted_x *= -1
        self._message_queue.append(self.dump_bounce_obstacle())
    
    def bounce_horizontal(self):
        self._velocity_y *= -1
        self._velocity_boosted_y *= -1
        self._message_queue.append(self.dump_bounce_obstacle())

    def activate_power_up(self, power = 2):
        self._power_boost = power
        self._is_powered_up = True

    def bounce_paddle_left(self, y, size, bonus):
        if self._is_powered_up is True:
            self._is_powered_up = False
        self._bounces += 1
        self._velocity_x *= -1
        offset = self._y - y
        norm = offset / (size / 2)
        bounce_angle = norm * MAX_BOUNCE_ANGLE
        self._speed *= self._speed_increment
        self._velocity_x = (self._speed * bonus) * math.cos(bounce_angle)
        self._velocity_y = (self._speed * bonus) * math.sin(bounce_angle)
        self._velocity_boosted_x = (self._speed * bonus) * math.cos(bounce_angle) * self._power_boost
        self._velocity_boosted_y = (self._speed * bonus) * math.sin(bounce_angle) * self._power_boost
        self._message_queue.append(self.dump_bounce_player())
    
    def bounce_paddle_right(self, y, size, bonus):
        if self._is_powered_up is True:
            self._is_powered_up = False
        self._bounces += 1
        offset = self._y - y
        norm = offset / (size / 2)
        bounce_angle = norm * MAX_BOUNCE_ANGLE
        self._speed *= self._speed_increment
        self._velocity_x = (self._speed * bonus) * math.cos(bounce_angle) * -1
        self._velocity_y = (self._speed * bonus) * math.sin(bounce_angle)
        self._velocity_boosted_x = (self._speed * bonus) * math.cos(bounce_angle) * self._power_boost * -1
        self._velocity_boosted_y = (self._speed * bonus) * math.sin(bounce_angle) * self._power_boost
        self._message_queue.append(self.dump_bounce_player())
    
    #check wether the ball is colliding with the x;y position
    def is_colliding(self, x, y):
        for i in range(0, PRECISION, 1):
            if self._is_powered_up is True:
                diff_x = self._x + (self._velocity_boosted_x * (i / PRECISION))
                diff_y = self._y + (self._velocity_boosted_y * (i / PRECISION))
            else:
                diff_x = self._x + (self._velocity_x * (i / PRECISION))
                diff_y = self._y + (self._velocity_y * (i / PRECISION))
            distance = math.sqrt((x - diff_x)**2 + (y - diff_y)**2)
            if distance <= self._radius :
                return True
        return False
    
    def update_position(self):
        if self._is_powered_up is True:
            self._x += self._velocity_boosted_x
            self._y += self._velocity_boosted_y
        else:
            self._x += self._velocity_x
            self._y += self._velocity_y
        self.round_values()
    
    def round_values(self):
        self._x = round(self._x, 4)
        self._y = round(self._y, 4)

    def dump_bounce_player(self):
        event = {
            "type": "bounce_player",
            "server": "1v1_classic",
            "answer": "yes",
            "room_id": self._room_id,
            "ball_x": self._x,
            "ball_y": self._y,
            "ball_speed": self._speed,
            "ball_boosted": self._is_powered_up
        }
        return event

    def dump_bounce_obstacle(self):
        event = {
            "type": "bounce_obstacle",
            "server": "1v1_classic",
            "answer": "yes",
            "room_id": self._room_id,
            "ball_x": self._x,
            "ball_y": self._y,
            "ball_speed": self._speed
        }
        return event
    
    #Setters and getters
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
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, value):
        self._speed = value

    @property
    def base_speed(self):
        return self._base_speed

    @base_speed.setter
    def base_speed(self, value):
        self._base_speed = value

    @property
    def velocity_x(self):
        return self._velocity_x

    @velocity_x.setter
    def velocity_x(self, value):
        self._velocity_x = value

    @property
    def velocity_y(self):
        return self._velocity_y

    @velocity_y.setter
    def velocity_y(self, value):
        self._velocity_y = value

    @property
    def velocity_boosted_x(self):
        return self._velocity_boosted_x

    @velocity_boosted_x.setter
    def velocity_boosted_x(self, value):
        self._velocity_boosted_x = value

    @property
    def velocity_boosted_y(self):
        return self._velocity_boosted_y

    @velocity_boosted_y.setter
    def velocity_boosted_y(self, value):
        self._velocity_boosted_y = value

    @property
    def speed_increment(self):
        return self._speed_increment

    @speed_increment.setter
    def speed_increment(self, value):
        self._speed_increment = value

    @property
    def bounce_angle_max(self):
        return self._bounce_angle_max

    @bounce_angle_max.setter
    def bounce_angle_max(self, value):
        self._bounce_angle_max = value

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        self._radius = value

    @property
    def bounces(self):
        return self._bounces

    @bounces.setter
    def bounces(self, value):
        self._bounces = value

    @property
    def is_powered_up(self):
        return self._is_powered_up

    @is_powered_up.setter
    def is_powered_up(self, value):
        self._is_powered_up = value

    @property
    def power_boost(self):
        return self._power_boost

    @power_boost.setter
    def power_boost(self, value):
        self._power_boost = value

    @property
    def message_queue(self):
        return self._message_queue

    @message_queue.setter
    def message_queue(self, value):
        self._message_queue = value
