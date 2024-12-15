from django.urls import re_path
from ping_pong.consumers import YourConsumer

websocket_urlpatterns = [
    re_path(r'ws/$', YourConsumer.as_asgi()),
]