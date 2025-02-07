from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from .views import create_match
from .views import MatchViewSet, HistoriqueViewSet, TournamentMatchViewSet, TournamentViewSet

urlpatterns = [
    path("<int:pk>", MatchViewSet.as_view({"get": "retrieve"}), name="game_page"),
    path("history/<str:username>", HistoriqueViewSet.as_view({"get": "get_matchs_history"}), name="history_page"),
    path("get_matchs_count/<str:username>", HistoriqueViewSet.as_view({"get": "get_matchs_count"}), name="get_matchs_count"),
    path("tournament_match/<int:pk>", TournamentMatchViewSet.as_view({"get": "retrieve"}), name="tournament_game_page"),
    path("tournament/<int:pk>", TournamentViewSet.as_view({"get": "retrieve"}), name="tournament_page"),
    path("get_tournaments", TournamentViewSet.as_view({"get": "retrieve_all"}), name="retrieve_all"),
    path('set_match', create_match, name='create_match'),
]