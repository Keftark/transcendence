from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from .views import create_match
from .views import MatchViewSet, HistoriqueViewSet

urlpatterns = [
    path("<int:pk>", MatchViewSet.as_view({"get": "retrieve"}), name="game_page"),
    path("history/<int:pk>", HistoriqueViewSet.as_view({"get": "retrive"}), name="history_page"),
    path("get_matchs_count/<str:username>", HistoriqueViewSet.as_view({"get": "get_matchs_count"}), name="get_matchs_count"),
    path('set_match', create_match, name='create_match'),
]