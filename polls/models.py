from datetime import datetime

from django.db import models
from django.utils import timezone

class Account(models.Model):
    username = models.CharField(max_length=20, unique=True)
    password = models.CharField(max_length=40, null=True)
    email = models.EmailField(max_length=150, unique=True)
    emailVerified = models.BooleanField(default=False)
    emailVerificationToken = models.CharField(null=True, max_length=200)
    emailVerificationTokenExpiration = models.DateTimeField(null=True)
    forgotPasswordCode = models.CharField(null=True, max_length=100)
    forgotPasswordCodeExpiration = models.DateTimeField(null=True)
    has_2fa = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=200, null=True)
    totp_config_url = models.CharField(max_length=200, null=True)
    account_deleted = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True)
    last_activity = models.DateTimeField(default=timezone.now)
    date_joined = models.DateTimeField(auto_now_add=True, auto_now=False)
    elo = models.IntegerField(null=True)
    rank = models.IntegerField(null=True)
    
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



