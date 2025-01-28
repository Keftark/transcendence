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

from .models import Match, MatchMembers
from .serializers import MatchSerializer

def create_match(request):
    if request.method == 'POST':
        try:
            # Parse JSON body
            data = json.loads(request.body)

            # Extract data
            status = data.get('status', '')
            user_1 = data.get('player_1', '')
            player_1 = AccountModel.objects.get(id=user_1)
            player_1_score = data.get('player_1_score', '')
            player_2 = data.get('player_2', '')
            player_2_score = data.get('player_2_score', '')
            start_timestamp = data.get('start_timestamp', '')
            stop_timestamp = data.get('stop_timestamp', '')
            winner = data.get('winner', '')

            # Validation

            if player_1 and player_2 == 0:
                return JsonResponse({'success': False, 'error': 'Missing required fields.'}, status=400)

            # Create user
            match = Match.objects.create(
                finished = True,
                started = False,
                winner = winner,
                match_id = 0,
                online = False,
                player_1 = player_1,
                player_1_score = player_1_score,
                player_2 = NULL,
                player_2_score = player_2_score,
                start_timestamp = start_timestamp,
                stop_timestamp =  stop_timestamp,
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