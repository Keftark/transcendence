from websockets.asyncio.server import serve
from websocket import create_connection
import time
import json

CENTRAL_PORT = 7777

class ServerObject:
    def __init__(self):
        self._server = None

    async def attempt_connection(self):
        if self._server is None:
            try:
                #curr = time.time() - start
                print("[", 0, "] : Attempting connection to central server.")
                connex = "ws://localhost:" + str(CENTRAL_PORT) + "/"
                self._server = create_connection(connex)
                #0 = time.time() - start
                print("[", 0, "] : Central server connected.")
            except Exception as e:
                self._server = None
                print("[", 0, "] : Couldn't connect to the central server :", e)
        else:
            await self.send(json.dumps(self.pong()))

    async def close(self):
        await self._server.close()

    async def send(self, data):
        try:
            await self._server.send(data)
        except Exception as e:
                self._server = None
                print("[", 0, "] : Got erroreee ", e)

    def pong(self):
        event = {
            "type": "pong",
            "id": 0
        }
        return event