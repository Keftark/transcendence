from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static

from .views import MatchViewSet, HistoriqueViewSet

urlpatterns = [
    path("<int:pk>", MatchViewSet.as_view({"get": "retrieve"}), name="game_page"),
    path("history/<int:pk>", HistoriqueViewSet.as_view({"get": "retrive"}), name="history_page"),
]