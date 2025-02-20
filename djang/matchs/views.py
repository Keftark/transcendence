from rest_framework import viewsets
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth.models import User
import json
from django.http import JsonResponse, HttpRequest
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from accounts.models import AccountModel
from .models import Match, Match2v2, MatchMembers, TournamentMatchModel, TournamentModel
from .serializers import MatchSerializer, Match2v2Serializer, TournamentSerializer
from django.db.models import Q, Max
from datetime import datetime

def create_match(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method.'}, status=405)

    try:
        data = json.loads(request.body)

        usernames = [data.get('player_1'), data.get('player_2'), data.get('winner')]
        accounts = AccountModel.objects.select_related("user").filter(user__username__in=usernames)

        account_map = {account.user.username: account for account in accounts}

        player_1 = account_map.get(data.get('player_1'))
        player_2 = account_map.get(data.get('player_2'))
        winner = account_map.get(data.get('winner'))

        if not player_1 or not player_2:
            return JsonResponse({'success': False, 'error': 'Missing required player(s).'}, status=400)

        match_id = (Match.objects.aggregate(Max("id"))["id__max"] or 0) + 1
        Match.objects.create(
            date = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            finished=True,
            started=False,
            winner=winner,
            match_id=match_id,
            player_1=player_1,
            player_1_score=data.get('player_1_score', 0),
            player_2=player_2,
            player_2_score=data.get('player_2_score', 0),
            start_timestamp=data.get('start_timestamp'),
            stop_timestamp=data.get('stop_timestamp'),
            status=data.get('status', '')
        )

        return JsonResponse({'success': True, 'message': 'Match successfully created.'})

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON.'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def create_match2v2(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method.'}, status=405)

    try:
        data = json.loads(request.body)

        usernames = [data.get('player_1'), data.get('player_2'), data.get('player_3'), data.get('player_4'),
                     data.get('winner1'), data.get('winner2')]

        accounts = AccountModel.objects.select_related("user").filter(user__username__in=usernames)

        account_map = {account.user.username: account for account in accounts}

        player_1 = account_map.get(data.get('player_1'))
        player_2 = account_map.get(data.get('player_2'))
        player_3 = account_map.get(data.get('player_3'))
        player_4 = account_map.get(data.get('player_4'))
        winner1 = account_map.get(data.get('winner1'))
        winner2 = account_map.get(data.get('winner2'))

        if not all([player_1, player_2, player_3, player_4]):
            return JsonResponse({'success': False, 'error': 'Missing required player(s).'}, status=400)

        match_id = (Match2v2.objects.aggregate(Max("id"))["id__max"] or 0) + 1

        Match2v2.objects.create(
            date = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
            finished=True,
            started=False,
            winner1=winner1,
            winner2=winner2,
            match_id=match_id,
            player_1=player_1,
            player_2=player_2,
            team_1_score=data.get('team_1_score', 0),
            player_3=player_3,
            player_4=player_4,
            team_2_score=data.get('team_2_score', 0),
            start_timestamp=data.get('start_timestamp'),
            stop_timestamp=data.get('stop_timestamp'),
            status=data.get('status', '')
        )

        return JsonResponse({'success': True, 'message': 'Match successfully created.'})

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON.'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

# Create your views here.
class MatchViewSet(viewsets.ModelViewSet):

    queryset = Match.objects
    serializer_class = MatchSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def retrieve(self, request: HttpRequest, pk):

        if (not self.queryset.filter(pk = pk).exists()):
            return Response({"detail": "Match not found."}, status=status.HTTP_404_NOT_FOUND)

        match = self.queryset.get(pk = pk)

        return Response(self.serializer_class(match).data, status=status.HTTP_200_OK)
    
class Match2v2ViewSet(viewsets.ModelViewSet):

    queryset = Match2v2.objects
    serializer_class = Match2v2Serializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def retrieve2v2(self, request: HttpRequest, pk):

        if (not self.queryset.filter(pk = pk).exists()):
            return Response({"detail": "Match not found."}, status=status.HTTP_404_NOT_FOUND)

        match2v2 = self.queryset.get(pk = pk)

        return Response(self.serializer_class(match2v2).data, status=status.HTTP_200_OK)
    
class HistoriqueViewSet(ViewSet):
    
    queryset = User.objects.all()
    serializer_class = MatchSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def retrive(self, request: HttpRequest, pk: int = None):
        
        user: User = get_object_or_404(User, pk=pk)
        
        member_game_model_list: list[MatchMembers] = MatchMembers.objects.filter(player=user)
        
        game_model_list: list[Match] = [member_game_model.game for member_game_model in member_game_model_list]
        
        games_data: list[dict] = self.serializer_class(game_model_list, many=True).data
        
        return Response(games_data)
    
    def get_matchs_count(self, request: HttpRequest, username):
        
        user = get_object_or_404(User, username=username)
        matchs = Match.objects.filter(Q(player_1=user.accountmodel) | Q(player_2=user.accountmodel))

        match_count = matchs.count()
        wins = matchs.filter(winner=user.accountmodel).count()
        return Response({
            "match_count": match_count,
            "wins": wins
        })

    def get_matchs_history(self, request: HttpRequest, username):
        
        user = get_object_or_404(User, username=username)
        matchs = Match.objects.filter(Q(player_1=user.accountmodel) | Q(player_2=user.accountmodel))

        matches_data = []
        match_count = matchs.count()
        wins = matchs.filter(winner=user.accountmodel).count()
        matches_data.append({
            "match_count": match_count,
            "wins": wins
        })
        for match in matchs:
            player_1 = User.objects.filter(username=match.player_1).first()
            player_2 = User.objects.filter(username=match.player_2).first()
            winner = User.objects.filter(username=match.winner).first()
            winner_name = winner.username if winner else "anonymous"
            player_1_name = player_1.username if player_1 else "anonymous"
            player_2_name = player_2.username if player_2 else "anonymous"
            matches_data.append({
                "is2v2": False,
                "date": match.date,
                "id": match.id,
                "player_1": player_1_name,
                "player_2": player_2_name,
                "winner": winner_name,
                "player_1_score": match.player_1_score,
                "player_2_score": match.player_2_score,
                "timer": match.stop_timestamp - match.start_timestamp
            })

        return Response(matches_data, status=status.HTTP_200_OK)
    
class Historique2v2ViewSet(ViewSet):
    
    queryset = User.objects.all()
    serializer_class = Match2v2Serializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def retrive2v2(self, request: HttpRequest, pk: int = None):
        
        user: User = get_object_or_404(User, pk=pk)
        
        member_game_model_list: list[MatchMembers] = MatchMembers.objects.filter(player=user)
        
        game_model_list: list[Match] = [member_game_model.game for member_game_model in member_game_model_list]
        
        games_data: list[dict] = self.serializer_class(game_model_list, many=True).data
        
        return Response(games_data)
    
    def get_matchs2v2_count(self, request: HttpRequest, username):
        
        user = get_object_or_404(User, username=username)
        matchs2v2 = Match2v2.objects.filter(Q(player_1=user.accountmodel) | Q(player_2=user.accountmodel) | Q(player_3=user.accountmodel) | Q(player_4=user.accountmodel))

        match_count = matchs2v2.count()
        wins = matchs2v2.filter(Q(winner1=user.accountmodel) | Q(winner2=user.accountmodel)).count()
        return Response({
            "match_count": match_count,
            "wins": wins
        })

    def get_matchs2v2_history(self, request: HttpRequest, username):
        
        user = get_object_or_404(User, username=username)
        matchs = Match2v2.objects.filter(Q(player_1=user.accountmodel) | Q(player_2=user.accountmodel) | Q(player_3=user.accountmodel) | Q(player_4=user.accountmodel))

        matches_data = []
        match_count = matchs.count()
        wins = matchs.filter(Q(winner1=user.accountmodel) | Q(winner2=user.accountmodel)).count()
        matches_data.append({
            "match_count": match_count,
            "wins": wins
        })
        for match in matchs:
            player_1 = User.objects.filter(username=match.player_1).first()
            player_2 = User.objects.filter(username=match.player_2).first()
            player_3 = User.objects.filter(username=match.player_3).first()
            player_4 = User.objects.filter(username=match.player_4).first()
            winner1 = User.objects.filter(username=match.winner1).first()
            winner2 = User.objects.filter(username=match.winner2).first()
            winner1_name = winner1.username if winner1 else "anonymous"
            winner2_name = winner1.username if winner2 else "anonymous"
            player_1_name = player_1.username if player_1 else "anonymous"
            player_2_name = player_2.username if player_2 else "anonymous"
            player_3_name = player_3.username if player_3 else "anonymous"
            player_4_name = player_4.username if player_4 else "anonymous"
            matches_data.append({
                "is2v2": True,
                "date": match.date,
                "id": match.match_id,
                "player_1": player_1_name,
                "player_2": player_2_name,
                "player_3": player_3_name,
                "player_4": player_4_name,
                "winner1": winner1_name,
                "winner2": winner2_name,
                "team_1_score": match.team_1_score,
                "team_2_score": match.team_2_score,
                "timer": match.stop_timestamp - match.start_timestamp
            })

        return Response(matches_data, status=status.HTTP_200_OK)

class TournamentMatchViewSet(viewsets.ModelViewSet):

    queryset = TournamentMatchModel.objects
    serializer_class = MatchSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def retrieve(self, request: HttpRequest, pk):

        if (not self.queryset.filter(pk = pk).exists()):
            return Response({"detail": "Match not found."}, status=status.HTTP_404_NOT_FOUND)

        match = self.queryset.get(pk = pk)

        return Response(self.serializer_class(match).data, status=status.HTTP_200_OK)
    
class TournamentViewSet(viewsets.ModelViewSet):
    queryset = TournamentModel.objects
    serializer_class = TournamentSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def retrieve(self, request: HttpRequest, pk):

        if (not self.queryset.filter(pk = pk).exists()):
            return Response({"detail": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)

        tournament = self.queryset.get(pk = pk)

        return Response(self.serializer_class(tournament).data, status=status.HTTP_200_OK)

    def retrieve_all(self, request: HttpRequest):
        tournaments = self.queryset.all
        return Response(self.serializer_class(tournaments).data, status=status.HTTP_200_OK)