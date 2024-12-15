# your_app_name/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class YourConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Handle disconnection logic here if needed
        pass

    async def receive(self, text_data):
        # Handle incoming messages
        await self.send(text_data="Message received!")
