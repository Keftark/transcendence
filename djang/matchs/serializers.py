from rest_framework import serializers

from django.contrib.auth.models import User
from django.db.models import QuerySet

from .models import Match, TournamentModel
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
    
class TournamentSerializer(serializers.ModelSerializer):
    tournament_id = serializers.SerializerMethodField()
    players = serializers.SerializerMethodField()
    matchs =  serializers.SerializerMethodField()
    winner = serializers.SerializerMethodField()

    class Meta:
        model = TournamentModel
        fields = ["tournament_id", "players", "matchs", "winner"]

    def get_winner(self, instance: Match):
        if (instance.winner is None):
            return None
        return instance.winner

