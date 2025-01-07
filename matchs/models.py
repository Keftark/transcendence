from __future__ import annotations
from datetime import datetime
from os.path import splitext

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Q, Model, CASCADE, ForeignKey, ImageField, OneToOneField
from django.dispatch import receiver
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_save, pre_delete
from ..accounts.models import AccountModel

class Match(models.Model):
    NOT_PLAYED = 0
    IN_PROGRESS = 1
    FINISHED = 2
    match_id = models.IntegerField()
    player_1 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player_1')
    player_1_score = models.IntegerField(null=True)
    
    player_2 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player_2')
    player_2_score = models.IntegerField(null=True)

    start_timestamp = models.BigIntegerField(null = True, blank = True)
    stop_timestamp = models.BigIntegerField(null = True, blank = True)
    
    winner = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='winner')
    status = models.IntegerField(default=NOT_PLAYED)

class Historique(models.Model):
    histo_id = models.IntegerField()
    match = models.ForeignKey(Match, on_delete=models.SET_NULL , null=True, related_name='match')
    goal_timestamp = models.BigIntegerField(null = True, blank = True)
    player = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player')
