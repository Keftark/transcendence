#!/usr/bin/env python

import asyncio
import threading
import time
import json
import sys
import os
import random
import string
import websockets
from websockets.asyncio.server import serve
from websockets.asyncio.client import connect
from websocket import create_connection
import signal
import sys
import User
from Logger import Logger
from signal import SIGPIPE, SIG_DFL
signal.signal(SIGPIPE,SIG_DFL)

start = time.time()
stopFlag = False
userList = []
logList = []

UPDATE_DELAY = 0.016
SERVER_PORT = 7777

chat_socket = None
_1v1_socket = None

logger = Logger()

def dump_health():
    global chat_socket, _1v1_socket
    event = {
        "chat_server": True if chat_socket is not None else False,
        "1v1_classic_server": True if _1v1_socket is not None else False,
    }
    return event

def id_generator(size=36, chars=string.ascii_uppercase + string.digits):
    global userList, logList
    attempt = ''.join(random.SystemRandom().choice(chars) for _ in range(size))
    while True:
        flag = False
        for user in userList:
            if attempt == user.key:
                flag = True
                break
        if flag is False:
            break
        attempt = ''.join(random.SystemRandom().choice(chars) for _ in range(size))    
    return attempt

def key_check(id, key):
    global userList
    for user in userList:
        if user.id == id:
            if user.key == key:
                return True
            return False
    return False

# Transfere la reponse du serveur au client
async def handle_answers(websocket, event, message):
    global start, userList, logList
    type = event["type"]
    server = event["server"]
    #print("Got answer :", event)
    if server == "1v1_classic":
        if type == "match_init":
            for user in userList:
                print("Checking user with ID :", user.id, "\tComparing with IDs", event["id_p1"], "and", event["id_p2"])
                if user.id == event["id_p1"] or user.id == event["id_p2"]:
                    print("Found user !")
                    user.room_id = (int)(event["room_id"])
        if "room_id" in event: #transmit to all user in room_id
            print("Sending to room id")
            for user in userList:
                print("Checking user with ID :", user.id, "\tIn room ID :", user.room_id, "in game", user.status)
                if user.status == "1v1_classic" and user.room_id == (int)(event["room_id"]):
                    print("Found corresponding room !")
                    await user.send(json.dumps(event))
        elif type == "join_queue":
            id = (int)(event["id"])
            for user in userList:
                if user.id == id:
                    user.status = "1v1_classic"
                    user.room_id = -1
                    break
        elif type == "exit_queue":
            id = (int)(event["id"])
            for user in userList:
                if user.id == id:
                    user.status = "here"
                    user.room_id = -1
                    break
        else:
            pass #transfer to room id
    elif type == "message" or type == "sticker":
        for user in userList:
            if user.id != id:
                await user.send(json.dumps(event))
    elif type == "room_message":
        for user in userList:
            if user.id != id and user.status == event["game"] and user.room == (int)(event["room_id"]):
                await user.send(json.dumps(event))
    else:
        for user in userList:
            if user.id == id:
                await user.send(json.dumps(event))

# Transfere la requete du client au serveur
#TODO: check si le client est log
async def handle_transfer(websocket, event):
    global start, userList, logList
    global chat_socket, _1v1_socket

    id = (int)(event["id"])
    server = event["server"]
    type = event["type"]

    for user in userList:
        if user.id == id:
            if user.key != event["key"]:
                print("Key not matching")
                return
            else:
                break

    if server == "chat":
        if type == "salon_message":
            for user in userList:
                if user.id == id:
                    event["room_id"] = user.room
                    event["game"] = user.game
        try:
            await chat_socket.send(json.dumps(event))
        except:
            chat_socket = None
    elif server == "1v1_classic":
        print("Oh hhhh")
        try:
            await _1v1_socket.send(json.dumps(event))
        except:
            _1v1_socket = None

#gere la connexion en interne
async def handle_log(websocket, event):
    global start, userList, logList
    id = (int)(event["id"])
    for user in userList:
        if user.id == id:
            return 
    flag = False
    for user in logList:
        if user.id == id:
            flag = True
            if event["socket"] == "input":
                user.sock_input = websocket
            elif event["socket"] == "output":
                user.sock_output = websocket
            if user.sock_input is not None and user.sock_output is not None:
                user.key = id_generator()
                logList.remove(user)
                userList.append(user)
                print("Created user with ID ::", user.id, "\tKey ::", user.key, "\t Adress::", user)
                await user.send(json.dumps(user.dump_key()))
            break
    if flag is False:
        user = User.User()
        user.id = id
        user.name = event["name"]
        if event["socket"] == "input":
            user.sock_input = websocket
        elif event["socket"] == "output":
            user.sock_output = websocket
        print("Added log user with ID ::", id, "\tAddress ::", user)
        logList.append(user)

async def handler(websocket):
    global start, userList, logList, logger
    global chat_socket, _1v1_socket
    try:
        async for message in websocket:
            event = json.loads(message)
            #print("GOT :", event)
            if event["type"] == "pong":
                pass
            elif event["type"] == "log":
                await handle_log(websocket, event)
            elif event["answer"] == "yes":
                await handle_answers(websocket, event, message)
            elif (event["server"] != "main"):
                await handle_transfer(websocket, event)
            else : #Commandes de serveur ...
                pass
        await websocket.wait_closed()
    except Exception as e:
        logger.log("", 2, e)
        print(message)
    finally:
        #TODO : Disconnection procedure
        if websocket == chat_socket:
            print("Yabadabadooo")
            chat_socket = None


async def tick_loop():
    global stopFlag
    while stopFlag is False:
        await asyncio.sleep(5)

def dump_setup():
    event = {
        "type": "setup"
    }
    return event

def ping():
    event = {
        "type": "ping"
    }
    return event

async def connection_loop():
    global start, stopFlag, logger
    global chat_socket, _1v1_socket
    while stopFlag is False:
        if chat_socket is None:
            try:
                logger.log("Attempting connection to Chat server.", 1)
                chat_socket = await connect("ws://localhost:7878/", ping_interval=10, ping_timeout=None)
                logger.log("Chat server connected.", 0)
            except Exception as e:
                chat_socket = None
                logger.log("Couldn't connect to the chat server.", 2, e)
        else:
            try:
                await chat_socket.send(json.dumps(ping()))
            except Exception as e:
                logger.log("", 2, e)
                chat_socket = None
        if _1v1_socket is None:
            try:
                logger.log("Attempting connection to Game (1v1 Classical) server.", 1)
                _1v1_socket = await connect("ws://localhost:8001/", ping_interval=10, ping_timeout=None)
                logger.log("Game (1v1 Classical) server connected.", 0)
            except Exception as e:
                _1v1_socket = None
                logger.log("Couldn't connect to the game (1v1 Classical) server.", 2, e)
        else:
            try:
                await _1v1_socket.send(json.dumps(ping()))
            except Exception as e:
                logger.log("", 2, e)
                _1v1_socket = None
        await asyncio.sleep(5)
    ###

def connection_handler():
    asyncio.run(connection_loop())

def ticker_thread():
    asyncio.run(tick_loop())

def server_thread():
    asyncio.run(main())

async def main():
    global stopFlag, start, logger
    global chat_socket, _1v1_socket
    logger.log("Listener thread launched.", 1)
    #loop = asyncio.get_running_loop()
    #stop = loop.create_future()
    #loop.add_signal_handler(signal.SIGINT, stop.set_result, None)
    #async with serve(handler, "", SERVER_PORT, ping_interval=10, ping_timeout=None):
    #    await stop  # run forever
    async with serve(handler, "", SERVER_PORT, ping_interval=10, ping_timeout=None):
        await asyncio.get_running_loop().create_future()  # run forever
    stopFlag = True

if __name__ == "__main__":
    logger.log("Central Server launched.", 0)
    try:
        ticker = threading.Thread(target=ticker_thread)
        connections = threading.Thread(target=connection_handler)
        server = threading.Thread(target=server_thread)
        ticker.daemon = True
        connections.daemon = True
        server.daemon = True
        ticker.start()
        connections.start()
        server.start()
        #asyncio.run(main())
        server.join()
        ticker.join()
        connections.join()
    except Exception as e:
        logger.log("Server exited with manual closure.", 0)
