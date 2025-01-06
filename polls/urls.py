from django.urls import path
from . import views

from .viewsets.MyAccountViewSet import MyAccountViewSet
from .serializers import AccountSerializer
from .models import AccountModel


urlpatterns = [
    path("", views.index, name="home"),
    path('home', views.index, name='home'),
    path('register', views.register_user, name='register_user'),
    path('login', views.login_user, name='login'),
    path('logout', views.logout_user, name='logout_user'),
    path('registering', views.registering, name='registering'),  # Registration page
    path('signIn', views.sign_in, name='signIn'),  # Sign-in page
    path('modes', views.modes, name='modes'),  # Modes page
    path('rules', views.rules, name='rules'),  # Rules page
    path('duel', views.duel, name='duel'),  # Duel page
    path('game-local', views.game_local, name='game-local'),  # Game local page
    path('game-ai', views.game_ai, name='game-ai'),  # Game AI page
    path('game-online', views.game_online, name='game-online'),  # Game online duel page
    path('tournament-menu', views.tournament_menu, name='tournament-menu'),  # Tournament menu page
    path('tournament-lobby', views.tournament_lobby, name='tournament-lobby'),  # Tournament lobby page
    path('tournament-join', views.tournament_join, name='tournament-join'),  # Tournament join page
    path('check-login/', views.check_user_login, name='check_user_login'),
    path('current_user', views.get_logged_in_user, name='current_user'),
    path('get-user/<str:username>/', views.get_user_by_name, name='get-user-by-name'),
    path('user/<int:user_id>/', views.get_user_by_id, name='user_detail'),
    path("me", MyAccountViewSet.as_view({'get': 'retrieve'}), name="my_account_page"),

]

