# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "game_room"  # Define the room or game ID
        self.room_group_name = f"game_{self.room_name}"

        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Handle disconnection, typically leave group
        await self.close()

    async def receive(self, text_data):
        # Handle the incoming message, process it, and send it back
        event = json.loads(text_data)
        # Example: broadcasting the event to the group
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))
