#!/usr/bin/env python

import asyncio
import Socket
import sys
import json
from websockets.asyncio.server import serve
from websockets.asyncio.client import connect
import signal
import threading
import Logger
import ssl 
import pathlib
from signal import SIGPIPE, SIG_DFL

signal.signal(SIGPIPE, 0)

SERVER_PORT = 7878
CENTRAL_PORT = 7777

Users = []

logger = Logger.Logger()

stopFlag = False

central_socket = None

localhost_pem = pathlib.Path(__file__).with_name("cponmamju2.fr_key.pem")
#loads up ssl crap
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(localhost_pem)
#loads up ssl crap but for clients
ssl_client = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_client.load_verify_locations(localhost_pem)

def dump_message(user, message):
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
    event = {
        "type": "pong",
        "id": 0
    }
    return event

def bye():
    event = {
        "type": "bye",
        "server": "chat"
    }
    return event

def is_user(id):
    global Users
    for user in Users:
        if user.id == id:
            return True
    return False

async def send_server(data):
    global central_socket
    try:
        await central_socket.send(json.dumps(data))
    except Exception as e:
        logger.log("", 2, e)
        central_socket = None

async def handler(websocket):
    global Users, central_socket, logger
    try:
        async for message in websocket:
            event = json.loads(message)
            print(event)
            if event["type"] == "ping":
                await send_server(pong())
            elif event["type"] == "join_chat":
                id = (int)(event["id"])
                if is_user(id) is False:
                    bl = event["blacklist"]
                    sock = Socket.UserSocket(websocket, id, bl, event["name"])
                    Users.append(sock)
            elif event["type"] == "quit_chat":
                    id = (int)(event["id"])
                    for user in Users:
                        if user.id == id:
                            Users.remove(user)
                            break
            elif event["type"] == "message" or event["type"] == "sticker":
                id = (int)(event["id"])
                if is_user(id) is True:
                    for user in Users:
                        if user.id == id:
                            if event["type"] == "sticker":
                                await send_server(sticker(user, event["img"]))
                            else:
                                await send_server(dump_message(user, event["content"]))
                            break
            elif event["type"] == "private_message" or event["type"] == "private_sticker":
                id = (int)(event["id"])
                target = (int)(event["target"])
                if is_user(id) is True and is_user(target) is True:
                    for user in Users:
                        if user.id == id:
                            for targ in Users:
                                if targ.id == target:
                                    if event["type"] == "private_sticker":
                                        await send_server(msg_private_sticker(targ, user, event["img"]))
                                    else:
                                        await send_server(msg_private(targ, user, event["content"]))
                                    break
            elif event["type"] == "salon_message" or event["type"] == "salon_sticker":
                id = (int)(event["id"])
                if is_user(id) is True:
                    for user in Users:
                        if user.id == target:
                            if event["type"] == "salon_message":
                                user.socket.send(json.dumps(msg_room(user, (int)(event["room_id"]), event["game"], event["content"])))
                            else:
                                user.socket.send(json.dumps(msg_room_sticker(user, (int)(event["room_id"]), event["game"], event["img"])))
                            break
        await websocket.wait_closed()
    except Exception as e:
        logger.log("", 2, e)
    finally:
        central_socket = None

async def main():
    global logger, stopFlag, central_socket, ssl_context
    logger.log("Chat listener launched.", 0)
    async with serve(handler, "", SERVER_PORT, ping_interval=10, ping_timeout=None, ssl=ssl_context):
        await asyncio.get_running_loop().create_future()  # run forever
    stopFlag = True


async def connection_handler():
    global central_socket, stopFlag, logger, ssl_context
    while stopFlag is False:
        if central_socket is None:
            try:
                logger.log("Attempting connection to central server.", 1)
                connex = "wss://172.17.0.1:" + str(CENTRAL_PORT) + "/"
                central_socket = await connect(connex, ping_interval=10, ping_timeout=None, ssl=ssl_client)
                logger.log("Central server connected.", 0)
            except Exception as e:
                central_socket = None
                logger.log("Couldn't connect to the central server.", 2, e)
        else:
            await send_server(pong())
        await asyncio.sleep(5)

def connection_launcher():
    asyncio.run(connection_handler())

def server_launcher():
    asyncio.run(main())

def signal_handler(signal, frame):
    global central_socket, stopFlag
    stopFlag = True
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