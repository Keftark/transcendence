import math
import random

MAX_BOUNCE_ANGLE = math.radians(60) 

class Ball:
    def __init__(self):
        self._x = 0
        self._y = 0
        self._speed = 0.5
        self._base_speed = self._speed
        self._velocity_x = self._speed if random.random() < 0.5 else self._speed * -1
        self._velocity_y = 0
        self._velocity_boosted_x = 0
        self._velocity_boosted_y = 0
        self._speed_increment = 0.005
        self._bounce_angle_max = 75 * math.pi / 180
        self._radius = 0.8
        self._bounces = 0
        self._is_powered_up = False
        self._power_boost = 2

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
    
    def bounce_horizontal(self):
        self._velocity_y *= -1
        self._velocity_boosted_y *= -1

    def activate_power_up(self, power = 2):
        self._power_boost = power
        self._is_powered_up = True

    def bounce_paddle_left(self, y, size):
        if self._is_powered_up is True:
            self._is_powered_up = False
        self._bounces += 1
        self._velocity_x *= -1
        offset = self._y - y
        norm = offset / (size / 2)
        bounce_angle = norm * MAX_BOUNCE_ANGLE
        self._speed += self._speed_increment
        self._velocity_x = self._speed * math.cos(bounce_angle)
        self._velocity_y = self._speed * math.sin(bounce_angle)
        self._velocity_boosted_x = self._speed * math.cos(bounce_angle) * self._power_boost
        self._velocity_boosted_y = self._speed * math.sin(bounce_angle) * self._power_boost
    
    def bounce_paddle_right(self, y, size):
        if self._is_powered_up is True:
            self._is_powered_up = False
        self._bounces += 1
        offset = self._y - y
        norm = offset / (size / 2)
        bounce_angle = norm * MAX_BOUNCE_ANGLE
        #self._speed = math.sqrt(self._velocity_x**2 + self._velocity_y**2)
        self._speed += self._speed_increment
        self._velocity_x = self._speed * math.cos(bounce_angle) * -1
        self._velocity_y = self._speed * math.sin(bounce_angle)
        self._velocity_boosted_x = self._speed * math.cos(bounce_angle) * self._power_boost * -1
        self._velocity_boosted_y = self._speed * math.sin(bounce_angle) * self._power_boost
    
    #check wether the ball is colliding with the x;y position
    def is_colliding(self, x, y):
        distance = math.sqrt((x - self._x)**2 + (y - self._y)**2)
        return True if distance <= self._radius else False
    
    def update_position(self):
        if self._is_powered_up is True:
            self._x += self._velocity_boosted_x
            self._y += self._velocity_boosted_y
        else:
            self._x += self._velocity_x
            self._y += self._velocity_y
    
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