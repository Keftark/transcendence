from __future__ import annotations
from datetime import datetime
from os.path import splitext

from django.db import models
from django.contrib.auth.models import User
from django.db.models import CASCADE, QuerySet
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_save, pre_delete
from accounts.models import AccountModel
import time


class Match(models.Model):
    finished = models.BooleanField(default = False)
    started = models.BooleanField(default = False)
    winner = models.ForeignKey(User, on_delete=CASCADE, null=True, blank=True)
    match_id = models.IntegerField()
    player_1 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player_1')
    player_1_score = models.IntegerField(null=True)
    
    player_2 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player_2')
    player_2_score = models.IntegerField(null=True)

    start_timestamp = models.BigIntegerField(null = True, blank = True)
    stop_timestamp = models.BigIntegerField(null = True, blank = True)
    
    winner = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='winner')
    status = models.IntegerField(default=started)

    def create(self, players: set[User]) -> Match:
        self.save()
        for player in players:
            MatchMembers(match = self, player=player).save()
        return self

    def start(self):
        self.start_timestamp = round(time.time() * 1000, 1)
        self.started = True
        self.save()
    
    def finish(self, winner: User):
        self.winner = winner
        self.finished = True
        self.stop_timestamp = round(time.time() * 1000, 1)
        self.save()

    def get_players(self) -> list[User]:
        return [match_player.player for match_player in MatchMembers.objects.filter(match = self)]
    
    def get_players_profiles(self) -> list[User]:
        return [match_player.player.accountmodel for match_player in MatchMembers.objects.filter(match = self)]
    
    def get_score_by_player_id(self, player_id: int) -> list[int]:
        query: QuerySet = Goal.objects.filter(game_id = self.pk, player_id = player_id)
        score_data: list[int] = [match_goal.timestamp for match_goal in query]
        
        return score_data
    
    def add_goal(self, goal_defenser: User):
        
        timestamp: int = round(time.time() * 1000, 1) - self.start_timestamp
        
        goal_model: Goal = Goal(player=goal_defenser, match=self, timestamp=timestamp)
        
        goal_model.save()
        
        return timestamp


class Match2v2(models.Model):
    finished = models.BooleanField(default = False)
    started = models.BooleanField(default = False)
    winner = models.ForeignKey(User, on_delete=CASCADE, null=True, blank=True)
    match_id = models.IntegerField()
    player_1 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player2v2_1')
    player_2 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player2v2_2')
    team_1_score = models.IntegerField(null=True)
    player_3 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player2v2_3')
    player_4 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player2v2_4')
    team_2_score = models.IntegerField(null=True)

    start_timestamp = models.BigIntegerField(null = True, blank = True)
    stop_timestamp = models.BigIntegerField(null = True, blank = True)
    
    winner1 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='winner2v2_1')
    winner2 = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='winner2v2_2')
    status = models.IntegerField(default=started)

    def create(self, players: set[User]) -> Match:
        self.save()
        for player in players:
            MatchMembers(match = self, player=player).save()
        return self

    def start(self):
        self.start_timestamp = round(time.time() * 1000, 1)
        self.started = True
        self.save()
    
    def finish(self, winner: User, winner2: User):
        self.winner = winner
        self.winner2 = winner2
        self.finished = True
        self.stop_timestamp = round(time.time() * 1000, 1)
        self.save()

    def get_players(self) -> list[User]:
        return [match_player.player for match_player in MatchMembers.objects.filter(match = self)]
    
    def get_players_profiles(self) -> list[User]:
        return [match_player.player.accountmodel for match_player in MatchMembers.objects.filter(match = self)]
    
    def get_score_by_player_id(self, player_id: int) -> list[int]:
        query: QuerySet = Goal.objects.filter(game_id = self.pk, player_id = player_id)
        score_data: list[int] = [match_goal.timestamp for match_goal in query]
        
        return score_data
    
    def add_goal(self, goal_defenser: User):
        
        timestamp: int = round(time.time() * 1000, 1) - self.start_timestamp
        
        goal_model: Goal = Goal(player=goal_defenser, match=self, timestamp=timestamp)
        
        goal_model.save()
        
        return timestamp


class MatchMembers(models.Model):
    match = models.ForeignKey(Match, on_delete=CASCADE)
    player = models.ForeignKey(User, on_delete=CASCADE)
    
class Goal(models.Model):
    
    match = models.ForeignKey(Match, on_delete=CASCADE)
    player = models.ForeignKey(User, on_delete=CASCADE)
    timestamp = models.IntegerField()

class Historique(models.Model):
    histo_id = models.IntegerField()
    match = models.ForeignKey(Match, on_delete=models.SET_NULL , null=True, related_name='match')
    goal_timestamp = models.BigIntegerField(null = True, blank = True)
    player = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player')

class Historique2v2(models.Model):
    histo_id = models.IntegerField()
    match = models.ForeignKey(Match2v2, on_delete=models.SET_NULL , null=True, related_name='match2v2')
    goal_timestamp = models.BigIntegerField(null = True, blank = True)
    player = models.ForeignKey(AccountModel, on_delete=models.SET_NULL, null=True, related_name='player2v2')
    

class TournamentMatchModel(models.Model):
    tournament_match_id = models.IntegerField()
    player_1 = models.CharField(max_length=150)
    player_1_score = models.IntegerField(null=True)
    player_2 = models.CharField(max_length=150)
    player_2_score = models.IntegerField(null=True)

class TournamentModel(models.Model):
    tournament_id = models.IntegerField()
    players = ArrayField(models.CharField(max_length=150))
    matchs =  ArrayField(models.IntegerField())
    winner = models.CharField(max_length=150)
