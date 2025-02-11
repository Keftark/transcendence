from rest_framework import serializers

from django.contrib.auth.models import User
from django.db.models import QuerySet

from .models import Match, Match2v2, TournamentModel
from accounts.serializers import AccountSerializer

class MatchSerializer(serializers.ModelSerializer):

    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()
    winner = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    started = serializers.SerializerMethodField()
    finished = serializers.SerializerMethodField()
    start_timestamp = serializers.SerializerMethodField()
    stop_timestamp = serializers.SerializerMethodField()
    match_type = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ["id", "winner", "state", "started", "finished", "player1", "player2", "start_timestamp", "stop_timestamp", "match_type"]

    def get_state(self, instance: Match):
        if (instance.finished):
            return "finished"
        if (instance.started):
            return "started"
        return "waiting"

    def get_winner(self, instance: Match):
        if (instance.winner is None):
            return None
        return AccountSerializer(instance.winner.accountmodel).data

    def get_players(self, instance: Match):
        return AccountSerializer(instance.get_players_profiles(), many=True).data
    
class Match2v2Serializer(serializers.ModelSerializer):

    player1 = serializers.SerializerMethodField()
    player2 = serializers.SerializerMethodField()
    player3 = serializers.SerializerMethodField()
    player4 = serializers.SerializerMethodField()
    winner1 = serializers.SerializerMethodField()
    winner2 = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    started = serializers.SerializerMethodField()
    finished = serializers.SerializerMethodField()
    start_timestamp = serializers.SerializerMethodField()
    stop_timestamp = serializers.SerializerMethodField()
    match_type = serializers.SerializerMethodField()

    class Meta:
        model = Match2v2
        fields = ["id", "winner1","winner2",  "state", "started", "finished", "player1", "player2", "player3", "player4", "start_timestamp", "stop_timestamp", "match_type"]

    def get_state2v2(self, instance: Match2v2):
        if (instance.finished):
            return "finished"
        if (instance.started):
            return "started"
        return "waiting"

    def get_winner1(self, instance: Match2v2):
        if (instance.winner1 is None):
            return None
        return AccountSerializer(instance.winner1.accountmodel).data
    
    def get_winner2(self, instance: Match2v2):
        if (instance.winner2 is None):
            return None
        return AccountSerializer(instance.winner2.accountmodel).data

    def get_players2v2(self, instance: Match2v2):
        return AccountSerializer(instance.get_players_profiles(), many=True).data
    
class TournamentSerializer(serializers.ModelSerializer):
    players = serializers.SerializerMethodField()
    matchs =  serializers.SerializerMethodField()
    winner = serializers.SerializerMethodField()

    class Meta:
        model = TournamentModel
        fields = ["players", "matchs", "winner"]

    def get_winner(self, instance: TournamentModel):
        if (instance.winner is None):
            return None
        return instance.winner

    def get_players(self, instance: TournamentModel):
        return TournamentSerializer(instance.players, many=True).data

