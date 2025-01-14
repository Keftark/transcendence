import asyncio
import json
import time
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
import logging

# Hardcoded variables for now, remove when moving to Docker
UPDATE_DELAY = 0.016
SERVER_PORT = 8001

SOCKLIST = set()
start = time.time()

# Dummy Match class for context
class Match:
    def __init__(self, room_id, player_1, player_2):
        self.room_id = room_id
        self.player_1 = player_1
        self.player_2 = player_2
        self.ended = False
    
    async def tick(self):
        # Perform the match update (simplified)
        pass

matchs = []

def dump_error(error):
    return {
        "type": "error",
        "content": error,
    }

def dump_all_matchs():
    event = []
    for m in matchs:
        details = {
            "room_id": m.room_id,
            "id_p1": m.player_1.id,
            "id_p2": m.player_2.id
        }
        event.append(details)
    return event

# Your WebSocket Consumer (replaces handler)
class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.id = self.scope['user']  # Example, this could come from user authentication
        self.room_id = None
        self.room_name = f"room_{self.room_id}"
        
        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Handle disconnection
        print(f"Client {self.id} disconnected.")
        # You might want to handle the disconnection logic here (e.g., leave match/queue)
        pass

    async def receive(self, text_data):
        event = json.loads(text_data)
        if event["type"] == "join":
            await self.join_queue(event)
        elif event["type"] == "quit":
            await self.quit_queue(event)
        elif event["type"] == "list_all":
            await self.send_match_list()

    async def join_queue(self, event):
        # Your existing logic to handle a join event
        print(f"Join request from {event['id']}")
        # Assume some queueing logic here
        await self.send(text_data=json.dumps(dump_error("joined_queue")))

    async def quit_queue(self, event):
        # Handle quit logic
        print(f"Quit request from {event['id']}")
        await self.send(text_data=json.dumps(dump_error("quit_queue")))

    async def send_match_list(self):
        match_list = dump_all_matchs()
        await self.send(text_data=json.dumps(match_list))

# ASGI routing
application = ProtocolTypeRouter({
    "websocket": URLRouter({
        re_path(r"^/ws/game/$", GameConsumer.as_asgi()),  # WebSocket URL route
    }),
})

