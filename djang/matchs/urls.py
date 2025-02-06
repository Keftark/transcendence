from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from .views import create_match
from .views import MatchViewSet, HistoriqueViewSet, TournamentMatchViewSet

urlpatterns = [
    path("<int:pk>", MatchViewSet.as_view({"get": "retrieve"}), name="game_page"),
    path("history/<str:username>", HistoriqueViewSet.as_view({"get": "get_matchs_history"}), name="history_page"),
    path("get_matchs_count/<str:username>", HistoriqueViewSet.as_view({"get": "get_matchs_count"}), name="get_matchs_count"),
    path("tournamen_match/<int:pk>", TournamentMatchViewSet.as_view({"get": "retrieve"}), name="tournament_game_page"),
    path('set_match', create_match, name='create_match'),
]