#!/usr/bin/env python

import asyncio
import threading
import time
import json
import os
from Queue import Queue
from websockets.asyncio.server import serve
from websockets.asyncio.client import connect
import sys
import signal
from Logger import Logger

#Take the variables from the .env
#Leave as comments until we are in docker !
# UPDATE_DELAY = os.environ["UPDATE_DELAY"]
# SERVER_PORT = os.environ["PORT_1V1_CLASSIC"]
# CENTRAL_PORT = os.environ["PORT_CENTRAL"]

#Hardcoded variables, to delete when in docker
UPDATE_DELAY = 0.016
SERVER_PORT = 8001
CENTRAL_PORT = 7777

central_socket = None

logger = Logger()
queue = Queue(logger)
matchs = []
lock = threading.Lock()
lock_a = asyncio.Lock()
stopFlag = False
message_queue = []

def dump_error(error, id):
    event = {
        "type": "error",
        "server": "1v1_classic",
        "answer": "yes",
        "content": error,
        "id": id
    }
    return event

def dump_exit_queue(id):
    event = {
        "type": "exit_queue",
        "server": "1v1_classic",
        "answer": "yes",
        "id": id
    }
    return event

def dump_all_matchs(id):
    event = []
    for m in matchs:
        details = {
            "room_id": m.room_id,
            "id_p1": m.player_1_paddle.id,
            "id_p2": m.player_2_paddle.id
        }
        event.append(details)
    data = {
        "type": "list_all",
        "server": "1v1_classic",
        "answer": "yes",
        "id": id,
        "data": event
    }
    return data

def search_for_player(id):
    for m in matchs:
        if m.player_1_paddle.id == id or m._player_2_paddle.id == id:
            event = {
                "type": "search_request",
                "result": "found_in_match",
                "server": "1v1_classic",
                "answer": "yes",
                "room_id": m.room_id
            }
            return event
    for q in queue.liste:
        if q.id == id:
            event = {
                "type": "search_request",
                "server": "1v1_classic",
                "answer": "yes",
                "result": "found_in_queue"
            }
            return event
    event = {
        "type": "search_request",
        "server": "1v1_classic",
        "answer": "yes",
        "result": "not_found"
    }
    return event

def dump_everything():
    global logger
    event = {
        "port": SERVER_PORT,
        "tick_rate": UPDATE_DELAY,
        "server": "1v1_classic",
        "answer": "yes",
        "execution_time": time.time() - logger.start,
        "in_queue": len(queue.liste),
        "matches": len(matchs),
        "author": "nmascrie"
    }
    return event

def dump_join_queue(id):
    event = {
        "type": "join_queue",
        "server": "1v1_classic",
        "answer": "yes",
        "ids" : [id],
        "data": {
            "id": id,
            "type": "join_queue",
        }
    }
    return event

def pong():
    event = {
        "type": "pong",
        "id": 0
    }
    return event

async def send_to_central():
    global message_queue, central_socket, lock, lock_a
    for message in message_queue:
        if central_socket is not None:  
            try:
                await central_socket.send(json.dumps(message))
                message_queue.remove(message)
            except Exception as e:
                central_socket = None
                logger.log("", 2, e)
        else:
            break

def add_to_queue(data):
    global message_queue, lock, lock_a
    message_queue.append(data)

def extend_to_queue(data):
    global message_queue, lock, lock_a
    message_queue.extend(data)

async def loop():
    global queue, matchs, stopFlag, message_queue, logger
    logger.log("Ticker thread launched.", 0)
    while stopFlag is False:
        #update queue
        found = await queue.tick()
        for found in queue.match_list:
            matchs.append(found)
        queue.match_list.clear()
        extend_to_queue(queue.message_queue)
        queue.message_queue.clear()
        #update all matches
        for m in matchs:
            m.tick()
            extend_to_queue(m.formatted_queue)
            m.formatted_queue.clear()
            if m.ended:
                logger.log("Match with room id " + str(m.room_id) + " has concluded.", 1)
                matchs.remove(m)
        await send_to_central()
        await asyncio.sleep(UPDATE_DELAY)

async def handler(websocket):
    global logger, queue, central_socket
    try:
        async for message in websocket:
            event = json.loads(message)
            if (event["type"] == "ping"):
                await central_socket.send(json.dumps(pong()))
            elif (event["type"] == "join"):
                logger.log("Join request from client ID ::" + str(event["id"]), 1)
                if (not queue.add_to_queue(event)):
                    add_to_queue(dump_error("already_in_queue", (int)(event["id"])))
                else:
                    add_to_queue(dump_join_queue((int)(event["id"])))
                    logger.log("Client ID " +  str(event["id"]) + " has joined Queue", 1)
            elif (event["type"] == "quit"):
                id = (int)(event["id"])
                queue.del_from_queue(id)
                logger.log("Client ID " + str(id) + " manually exited queue.", 1)
                add_to_queue(dump_exit_queue(id))
            elif (event["type"] == "input" or \
                event["type"] == "ready" or event["type"] == "pause" or \
                event["type"] == "quit_lobby"):
                room = (int)(event["room"])
                for m in matchs:
                    if m.room_id == room:
                        m.input(event)
                        break
            elif (event["type"] == "spectate"):
                room = (int)(event["room_id"])
                for m in matchs:
                    if (m.room_id == room):
                        m.add_spectator(websocket)
                    else:
                        m.remove_spectator(websocket)
            elif (event["type"] == "unspectate"):
                for m in matchs:
                    m.remove_spectator(websocket)
            elif (event["type"] == "list_all"):
                add_to_queue(dump_all_matchs())
            elif (event["type"] == "find_one"):
                id = (int)(event["id"])
                add_to_queue(search_for_player(id))
            elif (event["type"] == "dump_it_all_baby"):
                add_to_queue(dump_everything())
            else:
                add_to_queue(dump_error("unknown_command", (int)(event["id"])))
    except Exception as e:
        logger.log("", 2, e)

async def main():
    global stopFlag, logger
    logger.log("Listener thread launched.", 0)
    async with serve(handler, "", SERVER_PORT, ping_interval=10, ping_timeout=None):
        await asyncio.get_running_loop().create_future()  # run forever
    stopFlag = True

async def connection_handler():
    global central_socket, stopFlag, logger, queue
    while stopFlag is False:
        if central_socket is None:
            try:
                logger.log("Attempting connection to central server.", 1)
                connex = "ws://localhost:" + str(CENTRAL_PORT) + "/"
                central_socket = await connect(connex, ping_interval=10, ping_timeout=None)
                logger.log("TCentral server connected.", 1)
            except Exception as e:
                central_socket = None
                logger.log("Couldn't connect to the central server", 2, e)
        else:
            with lock:   
                try:
                    await central_socket.send(json.dumps(pong()))
                except Exception as e:
                    logger.log("", 2, e)
        await asyncio.sleep(5)

def connection_launcher():
    asyncio.run(connection_handler())

def server_launcher():
    asyncio.run(main())

def ticker_launcher():
    asyncio.run(loop())

def signal_handler(signal, frame):
    global central_socket, stopFlag
    stopFlag = True
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    logger.log("Server launched.", 0)
    try:
        ticker = threading.Thread(target=ticker_launcher)
        server = threading.Thread(target=server_launcher)
        connex = threading.Thread(target=connection_launcher)
        ticker.daemon = True
        server.daemon = True
        connex.daemon = True
        ticker.start()
        server.start()
        connex.start()
        ticker.join()
        server.join()
        connex.join()
    except:
        logger.log("Server exited with manual closure.", 0)
