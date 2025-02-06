from rest_framework import viewsets
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth.models import User
import json
from django.http import JsonResponse

from django.http import HttpRequest
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from accounts.models import AccountModel

from .models import Match, MatchMembers, TournamentMatchModel, TournamentModel
from .serializers import MatchSerializer, TournamentSerializer
from django.db.models import Q

def create_match(request):
    if request.method == 'POST':
        try:
            # Parse JSON body
            data = json.loads(request.body)

            # Extract data
            status = data.get('status', '')
            user_1 = data.get('player_1', '')
            player_1 = AccountModel.objects.filter(user__username=user_1).first()
            player_1_score = data.get('player_1_score', '')
            user_2 = data.get('player_2', '')
            player_2 = AccountModel.objects.filter(user__username=user_2).first()
            player_2_score = data.get('player_2_score', '')
            start_timestamp = data.get('start_timestamp', '')
            stop_timestamp = data.get('stop_timestamp', '')
            winner = data.get('winner', '')
            win = AccountModel.objects.filter(user__username=winner).first()

            # Validation

            if player_1 and player_2 == 0:
                return JsonResponse({'success': False, 'error': 'Missing required fields.'}, status=400)

            # Create match
            match = Match.objects.create(
                finished = True,
                started = False,
                winner = win,
                match_id = Match.objects.count(),
                player_1 = player_1,
                player_1_score = player_1_score,
                player_2 = player_2,
                player_2_score = player_2_score,
                start_timestamp = start_timestamp,
                stop_timestamp =  stop_timestamp,
                status = status
            )
            match.save()
            return JsonResponse({'success': True, 'message': 'Match successfully created.'})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method.'}, status=405)

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
                "id": match.id,
                "player_1": player_1_name,
                "player_2": player_2_name,
                "winner": winner_name,
                "player_1_score": match.player_1_score,
                "player_2_score": match.player_2_score,
                "timer": match.stop_timestamp - match.start_timestamp
                # "date": match.date.isoformat()  # Format the date to ISO format
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

        match = self.queryset.get(pk = pk)

        return Response(self.serializer_class(match).data, status=status.HTTP_200_OK)