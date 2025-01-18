from django.urls import path
from .views import user
#from .views.user import update_profile, update_password
from django.conf import settings
from django.conf.urls.static import static
from .viewsets.MyAccountViewSet import MyAccountViewSet
from .serializers import AccountSerializer
from .models import AccountModel
from .views.friends import (GetFriendsView,
                            EditFriendView,
                            GetIncomingFriendRequestView,
                            GetOutgoingFriendRequestView)



urlpatterns = [
    path("", user.index, name="home"),
    path('home', user.index, name='home'),
    path('register', user.register_user, name='register_user'),
    path('login', user.login_user, name='login'),
    path('logout', user.logout_user, name='logout_user'),
    path('registering', user.registering, name='registering'),  # Registration page
    path('signIn', user.sign_in, name='signIn'),  # Sign-in page
    path('modes', user.modes, name='modes'),  # Modes page
    path('rules', user.rules, name='rules'),  # Rules page
    path('duel', user.duel, name='duel'),  # Duel page
    path('game-local', user.game_local, name='game-local'),  # Game local page
    path('game-ai', user.game_ai, name='game-ai'),  # Game AI page
    path('game-online', user.game_online, name='game-online'),  # Game online duel page
    path('tournament-menu', user.tournament_menu, name='tournament-menu'),  # Tournament menu page
    path('tournament-lobby', user.tournament_lobby, name='tournament-lobby'),  # Tournament lobby page
    path('tournament-join', user.tournament_join, name='tournament-join'),  # Tournament join page
    path('check-login/', user.check_user_login, name='check_user_login'),
    path('current_user', user.get_logged_in_user, name='current_user'),
    path('useravatar/<str:username>/', user.get_user_avatar, name='user_avatar'),
    path('uploadavatar/', user.upload_avatar, name='user_uploadavatar'),
    path('user_paddle/<int:user_id>/', user.get_user_paddle, name='user_paddle'),
    path('get-user/<str:username>/', user.get_user_by_name, name='get-user-by-name'),
    path('user/<int:user_id>/', user.get_user_by_id, name='user_detail'),
    path('username/<int:user_id>/', user.get_username, name='user_name_only'),
    path("me", MyAccountViewSet.as_view({'get': 'retrieve'}), name="my_account_page"), #My Account page
    #path("update-profile", update_profile.UpdateProfileView.as_view(), name="update-user"), # update user
    #path('update_password', update_password.UpdatePasswordView.as_view(), name='update_password'), # update user password
    path("settings", MyAccountViewSet.as_view({'patch': 'partial_update', 'delete': 'delete_avatar'}), name="my_profile_page"), #Update account page
    path("friends", GetFriendsView.as_view(), name="friends_list_page"), # Friends list page
    path("friends/<int:pk>", EditFriendView.as_view(), name="friends_edit_page"), # Edit friend (remove friend)
    path("incoming_friend_requests", GetIncomingFriendRequestView.as_view(), name="incoming_friend_requests"), #list of incoming friends requests
    path("outgoing_friend_requests", GetOutgoingFriendRequestView.as_view(), name="outgoing_friend_requests"), #list of outgoing friends requests
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
