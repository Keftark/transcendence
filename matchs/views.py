from rest_framework import viewsets
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth.models import User

from django.http import HttpRequest
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404


from .models import Match, MatchMembers
from .serializers import MatchSerializer

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