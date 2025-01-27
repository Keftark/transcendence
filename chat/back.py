"""Main file for chat server."""
#!/usr/bin/env python

import asyncio
import sys
import json
import signal
import threading
import ssl
import pathlib
import os
from dataclasses import dataclass
from signal import SIGPIPE
from websockets.asyncio.server import serve
from websockets.asyncio.client import connect
from socket_ft import UserSocket
import logger

signal.signal(SIGPIPE, 0)

UPDATE_DELAY = os.environ["UPDATE_DELAY"]
SERVER_PORT = os.environ["PORT_1V1_CLASSIC"]
CENTRAL_PORT = os.environ["PORT_CHAT"]

Users = []

logger = logger.Logger()

STOP_FLAG = False


@dataclass
class SocketData:
    """Dataclass for sockets.
    """
    CENTRAL_SOCKET = None
    STOP_FLAG = False

Sockets = SocketData

localhost_pem = pathlib.Path("/etc/certs/cponmamju2.fr_key.pem")
#loads up ssl crap
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(localhost_pem)
#loads up ssl crap but for clients
ssl_client = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_client.load_verify_locations(localhost_pem)

def dump_message(user, message):
    """Dumps a message. Contains user data and message content.

    Args:
        user (UserSocket): user data.
        message (string): message data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "message",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "content": message
    }
    return event

def sticker(user, img):
    """Dumps a sticker. Contains user data and image content.

    Args:
        user (UserSocket): user data.
        img (string): image data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "sticker",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "img": img
    }
    return event

def msg_private(user, sender, message):
    """Dumps a private message from sender to user.
    Contains both users data and message content.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.
        message (string): message data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "private_message",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "content": message
    }
    return event

def msg_private_sticker(user, sender, img):
    """Dumps a private sticker from sender to user.
    Contains both users data and image content.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.
        img (string): image data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "private_sticker",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "img": img
    }
    return event

def msg_room(user, room, game, message):
    """Dumps a message to a game room.
    Contains user data and message content.

    Args:
        user (UserSocket): user data.
        room (int) : ID of the room.
        game (string) : game type of the room.
        message (string): message data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "salon_message",
        "server": "main",
        "room_id": room,
        "game": game,
        "name": user.name,
        "id": user.id,
        "content": message
    }
    return event

def msg_room_sticker(user, room, game, img):
    """Dumps a message to a game room.
    Contains user data and image content.

    Args:
        user (UserSocket): user data.
        room (int) : ID of the room.
        game (string) : game type of the room.
        img (string): image data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "salon_sticker",
        "server": "main",
        "room_id": room,
        "game": game,
        "name": user.name,
        "id": user.id,
        "img": img
    }
    return event

def pong():
    """PING PONG

    Returns:
        PONG: PING
    """
    event = {
        "type": "pong",
        "id": 0
    }
    return event

def is_user(_id):
    """Returns wether the client is in the chat or not.

    Args:
        _id (int): ID of the user.

    Returns:
        bool: `True` if the user is logged to the chat, `False` otherwise.
    """
    for user in Users:
        if user.id == _id:
            return True
    return False

async def send_server(data):
    """Sends data to the central server.

    Args:
        data (dict): data to send.
    """
    try:
        await Sockets.CENTRAL_SOCKET.send(json.dumps(data))
    except Exception as e:
        logger.log("", 2, e)
        Sockets.CENTRAL_SOCKET = None

async def handler(websocket):
    """Receives and handle incomming messages from websocket.

    Args:
        websocket (WebSocket): The WS to read from.
    """
    try:
        async for message in websocket:
            event = json.loads(message)
            print(event)
            if event["type"] == "ping":
                await send_server(pong())
            elif event["type"] == "join_chat":
                _id = (int)(event["id"])
                if is_user(id) is False:
                    sock = UserSocket(_id, event["name"])
                    Users.append(sock)
            elif event["type"] == "quit_chat":
                _id = (int)(event["id"])
                for user in Users.copy():
                    if user.id == _id:
                        Users.remove(user)
                        break
            elif event["type"] == "message" or event["type"] == "sticker":
                _id = (int)(event["id"])
                if is_user(id) is True:
                    for user in Users:
                        if user.id == _id:
                            if event["type"] == "sticker":
                                await send_server(sticker(user, event["img"]))
                            else:
                                await send_server(dump_message(user, event["content"]))
                            break
            elif event["type"] == "private_message" or event["type"] == "private_sticker":
                _id = (int)(event["id"])
                target = (int)(event["target"])
                if is_user(id) is True and is_user(target) is True:
                    for user in Users:
                        if user.id == _id:
                            for targ in Users:
                                if targ.id == target:
                                    if event["type"] == "private_sticker":
                                        await send_server(msg_private_sticker
                                                          (targ, user, event["img"]))
                                    else:
                                        await send_server(msg_private
                                                          (targ, user, event["content"]))
                                    break
            elif event["type"] == "salon_message" or event["type"] == "salon_sticker":
                _id = (int)(event["id"])
                if is_user(id) is True:
                    for user in Users:
                        if user.id == _id:
                            if event["type"] == "salon_message":
                                await send_server(msg_room(user, (int)(event["room_id"])
                                                           , event["game"], event["content"]))
                            else:
                                await send_server(msg_room_sticker(user, (int)(event["room_id"])
                                                                   , event["game"], event["img"]))
                            break
        await websocket.wait_closed()
    except Exception as e:
        logger.log("", 2, e)
    finally:
        SocketData.CENTRAL_SOCKET = None

async def main():
    """Opens up the server and starts listening on SERVER_PORT (by default 7878)
    """
    logger.log("Chat listener launched.", 0)
    async with serve(handler, "", SERVER_PORT, ping_interval=10,
                     ping_timeout=None, ssl=ssl_context):
        await asyncio.get_running_loop().create_future()  # run forever
    SocketData.STOP_FLAG = True


async def connection_handler():
    """Loop that handles connection to central server. 

    Sleeps for 5 seconds, and sends a ping to the server. If the server isn't
    connected, attempts to connect instead.
    """
    while SocketData.STOP_FLAG is False:
        if SocketData.CENTRAL_SOCKET is None:
            try:
                logger.log("Attempting connection to central server.", 1)
                uri = "wss://172.17.0.1:" + str(CENTRAL_PORT) + "/"
                SocketData.CENTRAL_SOCKET = await connect(uri, ping_interval=10,
                                                          ping_timeout=None, ssl=ssl_client)
                logger.log("Central server connected.", 0)
            except Exception as e:
                SocketData.CENTRAL_SOCKET = None
                logger.log("Couldn't connect to the central server.", 2, e)
        else:
            await send_server(pong())
        await asyncio.sleep(5)

def connection_launcher():
    """Launches the connection handler as a asyncio task.
    """
    asyncio.run(connection_handler())

def server_launcher():
    """Launches the server handler as a asyncio task.
    """
    asyncio.run(main())

def signal_handler(signal, frame):
    """blabla

    Args:
        signal (_type_): _description_
        frame (_type_): _description_
    """
    SocketData.STOP_FLAG = True
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    logger.log("Server launched.", 0)
    try:
        ticker = threading.Thread(target=connection_launcher, daemon=True)
        server = threading.Thread(target=server_launcher, daemon=True)
        ticker.start()
        server.start()
        ticker.join()
        server.join()
    except Exception as e:
        logger.log("Server exited with manual closure.", 0, e)
