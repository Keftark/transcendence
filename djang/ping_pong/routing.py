from django.urls import re_path
from ping_pong import consumers  # Ensure this is the correct import

websocket_urlpatterns = [
    re_path(r'ws/game$', consumers.GameConsumer.as_asgi()),  # Ensure the '$' at the end
]