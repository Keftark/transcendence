# your_app_name/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class YourWebSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Perform WebSocket connection logic
        self.room_group_name = 'your_group_name'

        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Perform disconnection logic
        pass

    async def receive(self, text_data):
        # Handle receiving data from the WebSocket
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message back to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
