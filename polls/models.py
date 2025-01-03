from datetime import datetime

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

class Account(models.Model):
    account_id= models.CharField(max_length=140, default='SOME STRING')
    email = models.EmailField(unique=True, null=True)
    username = models.CharField(max_length=150, null=True)
    description = models.CharField(max_length=150, default='')
    is42 = models.BooleanField(default=False)
    isOfficial = models.BooleanField(default=False)
    follows = ArrayField(models.IntegerField(), default=list)
    friendRequests = ArrayField(models.IntegerField(), default=list)
    status = models.CharField(max_length=150, default="online")
    nbNewNotifications = models.IntegerField(default=0)
    blockedUsers = ArrayField(models.IntegerField(), default=list)
    player = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user', null=True)
    favoritesChannels = ArrayField(models.TextField(), default=list)
    resetPasswordID = models.CharField(max_length=150, default='')
    emailAlerts = models.BooleanField(default=True)
    
class Match(models.Model):
    NOT_PLAYED = 0
    IN_PROGRESS = 1
    FINISHED = 2
    player_1 = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='player_1')
    player_1_score = models.IntegerField(null=True)
    
    player_2 = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='player_2')
    player_2_score = models.IntegerField(null=True)
    
    winner = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='winner')
    match_id = models.IntegerField()
    status = models.IntegerField(default=NOT_PLAYED)