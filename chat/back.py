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
import dumps
import logger

signal.signal(SIGPIPE, 0)

UPDATE_DELAY        = (float)(os.environ.get("UPDATE_DELAY", 0.16))
SERVER_PORT         = os.environ.get("PORT_CHAT", 7878)
CENTRAL_PORT        = os.environ.get("PORT_CENTRAL", 7777)
DEBUG               = (bool)(os.environ.get("DEBUG", False))

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

async def message_handler(event):
    """Handles messages.

    Args:
        event (dict): Dict containing the data of the
        message.
    """
    _id = (int)(event["id"])
    if is_user(id) is True:
        for user in Users:
            if user.id == _id:
                if event["type"] == "sticker":
                    await send_server(dumps.sticker(user, event["img"]))
                else:
                    await send_server(dumps.dump_message(user, event["content"]))
                break

async def private_handler(event):
    """Handles private messages.

    Args:
        event (dict): Dict containing the data of the
        message.
    """
    _id = (int)(event["id"])
    target = (int)(event["target"])
    if is_user(id) is True and is_user(target) is True:
        for user in Users:
            if user.id == _id:
                for targ in Users:
                    if targ.id == target:
                        if event["type"] == "private_sticker":
                            await send_server(dumps.msg_private_sticker
                                                (targ, user, event["img"]))
                        else:
                            await send_server(dumps.msg_private
                                                (targ, user, event["content"]))
                        break

async def salon_handler(event):
    """Handles salon messages.

    Args:
        event (dict): Dict containing the data of the
        message.
    """
    _id = (int)(event["id"])
    if is_user(id) is True:
        for user in Users:
            if user.id == _id:
                if event["type"] == "salon_message":
                    await send_server(dumps.msg_room(user, (int)(event["room_id"])
                                                , event["game"], event["content"]))
                else:
                    await send_server(dumps.msg_room_sticker(user, (int)(event["room_id"])
                                                        , event["game"], event["img"]))
                break

async def friends_handler(event):
    """Handles friend messages.

    Args:
        event (dict): Dict containing the data of the
        message.
    """
    _id = (int)(event["id"])
    target = (int)(event["target"])
    if is_user(id) is True and is_user(target) is True:
        for user in Users:
            if user.id == _id:
                for targ in Users:
                    if targ.id == target:
                        if event["method"] == "invite":
                            await send_server(dumps.invite_friend(targ, user))
                        elif event["method"] == "accept":
                            await send_server(dumps.accept_friend(targ, user))
                        else: #refuse
                            await send_server(dumps.refuse_friend(targ, user))
                        break

async def chat_handler(event):
    """Handles joining and quitting chat events.

    Args:
        event (dict): Dict containing the data of the
        message.
    """
    if event["type"] == "join_chat":
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

async def handler(websocket):
    """Receives and handle incomming messages from websocket.

    Args:
        websocket (WebSocket): The WS to read from.
    """
    try:
        async for message in websocket:
            event = json.loads(message)
            if DEBUG is True:
                logger.log(event, 3)
            if event["type"] == "ping":
                await send_server(pong())
            elif event["type"] == "join_chat" or event["type"] == "quit_chat":
                await chat_handler(event)
            elif event["type"] == "message" or event["type"] == "sticker":
                await message_handler(event)
            elif event["type"] == "private_message" or event["type"] == "private_sticker":
                await private_handler(event)
            elif event["type"] == "salon_message" or event["type"] == "salon_sticker":
                await salon_handler(event)
            elif event["type"] == "friend":
                await friends_handler(event)
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
