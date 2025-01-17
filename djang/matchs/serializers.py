from rest_framework import serializers

from django.contrib.auth.models import User
from django.db.models import QuerySet

from .models import Match
from accounts.serializers import AccountSerializer

class MatchSerializer(serializers.ModelSerializer):

    players = serializers.SerializerMethodField()
    winner = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    started = serializers.ReadOnlyField()
    finished = serializers.ReadOnlyField()
    start_timestamp = serializers.ReadOnlyField()
    stop_timestamp = serializers.ReadOnlyField()
    match_type = serializers.ReadOnlyField()

    class Meta:
        model = Match
        fields = ["id", "winner", "state", "started", "finished", "players", "start_timestamp", "stop_timestamp", "match_type"]

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
