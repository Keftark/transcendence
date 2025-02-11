from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from .views import create_match, create_match2v2
from .views import MatchViewSet, Match2v2ViewSet, HistoriqueViewSet, Historique2v2ViewSet, TournamentMatchViewSet, TournamentViewSet

urlpatterns = [
    path("<int:pk>", MatchViewSet.as_view({"get": "retrieve"}), name="game_page"),
    path("2v2/<int:pk>", Match2v2ViewSet.as_view({"get": "retrieve2v2"}), name="game2v2_page"),
    path("history/<str:username>", HistoriqueViewSet.as_view({"get": "get_matchs_history"}), name="history_page"),
    path("history2v2/<str:username>", Historique2v2ViewSet.as_view({"get": "get_matchs2v2_history"}), name="history2v2_page"),
    path("get_matchs_count/<str:username>", HistoriqueViewSet.as_view({"get": "get_matchs_count"}), name="get_matchs_count"),
    path("get_matchs2v2_count/<str:username>", Historique2v2ViewSet.as_view({"get": "get_matchs2v2_count"}), name="get_matchs2v2_count"),
    path("tournament_match/<int:pk>", TournamentMatchViewSet.as_view({"get": "retrieve"}), name="tournament_game_page"),
    path("tournament/<int:pk>", TournamentViewSet.as_view({"get": "retrieve"}), name="tournament_page"),
    path("get_tournaments", TournamentViewSet.as_view({"get": "retrieve_all"}), name="retrieve_all"),
    path('set_match', create_match, name='create_match'),
    path('set_match2v2', create_match2v2, name='create_match2v2'),
]