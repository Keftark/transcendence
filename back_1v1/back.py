"""What is a god, omnipotence given form"""
#!/usr/bin/env python

import asyncio
import threading
import time
import json
import sys
import signal
import ssl
import pathlib
import os
from dataclasses import dataclass
from queue_ft import Queue
from websockets.asyncio.server import serve
from websockets.asyncio.client import connect
from logger import Logger

UPDATE_DELAY        = (float)(os.environ.get("UPDATE_DELAY", 0.16))
SERVER_PORT         = os.environ.get("PORT_1V1_CLASSIC", 8001)
CENTRAL_PORT        = os.environ.get("PORT_CENTRAL", 7777)
DEBUG               = (bool)(os.environ.get("DEBUG", False))

@dataclass
class SocketData:
    """Dataclass for sockets.
    """
    CENTRAL_SOCKET = None
    STOP_FLAG = False

Sockets = SocketData

logger = Logger()
queue = Queue(logger)
matchs = []
lock = threading.Lock()
lock_a = asyncio.Lock()
message_queue = []
parse_queue = []

localhost_pem = pathlib.Path("/etc/certs/cponmamju2.fr_key.pem")
#loads up ssl crap
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(localhost_pem)
#loads up ssl crap but for clients
ssl_client = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_client.load_verify_locations(localhost_pem)

def dump_error(error, _id):
    """Dumps an error.

    Args:
        error (string): Textual content of the error.
        _id (int): ID of the user to dump to.

    Returns:
        dict: Dumped error.
    """
    event = {
        "type": "error",
        "server": "1v1_classic",
        "answer": "yes",
        "content": error,
        "ids": [_id],
        "id": _id
    }
    return event

def dump_exit_queue(_id):
    """Dump the event of a user exiting the queue.

    Args:
        _id (int): ID of the user.

    Returns:
        dict: Dumped event.
    """
    event = {
        "type": "exit_queue",
        "server": "1v1_classic",
        "answer": "yes",
        "ids": [_id],
        "id": _id
    }
    return event

def dump_all_matchs(_id):
    """Dumps info about all current matches.

    Args:
        _id (int): ID of the querying user.

    Returns:
        dict: Dumped event.
    """
    event = []
    for m in matchs:
        details = {
            "room_id": m.room_id,
            "id_p1": m.paddle_1.id,
            "id_p2": m.paddle_2.id
        }
        event.append(details)
    data = {
        "type": "list_all",
        "server": "1v1_classic",
        "answer": "yes",
        "ids": [_id],
        "id": _id,
        "data": event
    }
    return data

def search_for_player(_id):
    """Search for a player by its ID.

    Args:
        _id (int): ID of the researched player.

    Returns:
        dict: Dumped event.
    """
    for m in matchs:
        if _id in {m.paddle_1.id, m.paddle_2.id}:
            event = {
                "type": "search_request",
                "result": "found_in_match",
                "server": "1v1_classic",
                "answer": "yes",
                "ids": [_id],
                "room_id": m.room_id
            }
            return event
    for q in queue.liste:
        if q.id == _id:
            event = {
                "type": "search_request",
                "server": "1v1_classic",
                "answer": "yes",
                "ids": [_id],
                "result": "found_in_queue"
            }
            return event
    event = {
        "type": "search_request",
        "server": "1v1_classic",
        "answer": "yes",
        "ids": [_id],
        "result": "not_found"
    }
    return event

def dump_everything(_id):
    """Dump a bunch of things.

    Args:
        _id (int): ID of the querying user.

    Returns:
        dict: Dumped event.
    """
    event = {
        "port": SERVER_PORT,
        "tick_rate": UPDATE_DELAY,
        "server": "1v1_classic",
        "answer": "yes",
        "execution_time": time.time() - logger.start,
        "in_queue": len(queue.liste),
        "matches": len(matchs),
        "ids": [_id],
        "author": "nmascrie"
    }
    return event

def dump_join_queue(_id):
    """Dumps the event of an user joining queue.

    Args:
        _id (int): ID of the user.

    Returns:
        dict: Dumped event.
    """
    event = {
        "type": "join_queue",
        "server": "1v1_classic",
        "answer": "yes",
        "ids" : [_id],
        "data": {
            "id": _id,
            "type": "join_queue",
        }
    }
    return event

def pong():
    """PING PONG

    Returns:
        dict: Dumped event.
    """
    event = {
        "type": "pong",
        "id": 0
    }
    return event

async def send_server(data):
    """Sends data to the central server.

    Args:
        data (dict): Data to send.
    """
    try:
        await Sockets.CENTRAL_SOCKET.send(json.dumps(data))
    except Exception as e:
        logger.log("", 2, e)
        Sockets.CENTRAL_SOCKET = None

async def send_to_central():
    """Sends all the data from the message queue to the central
    Server.
    """
    with lock:
        for message in message_queue.copy():
            if Sockets.CENTRAL_SOCKET is not None:
                try:
                    await send_server(message)
                    message_queue.remove(message)
                except Exception as e:
                    Sockets.CENTRAL_SOCKET = None
                    logger.log("", 2, e)
            else:
                break

def add_to_queue(data):
    """Adds a message to the message queue.

    Args:
        data (dict): Data to add.
    """
    message_queue.append(data)

def extend_to_queue(data):
    """Adds multiple messages to the message queue.

    Args:
        data (dict): Dict of data to add.
    """
    message_queue.extend(data)

def add_to_parse(data):
    """_summary_

    Args:
        data (_type_): _description_
    """
    with lock:
        parse_queue.append(data)

async def loop():
    """Ticker loop.

    Ticks down the queue and every match every UPDATE_DELAY seconds
    (by default, 0.016 or 60 times a second)
    """
    logger.log("Ticker thread launched.", 0)
    while Sockets.STOP_FLAG is False:
        parser()
        #update queue
        found = await queue.tick()
        for found in queue.match_list:
            matchs.append(found)
        queue.match_list.clear()
        extend_to_queue(queue.message_queue)
        queue.message_queue.clear()
        #update all matches
        for m in matchs.copy():
            m.tick()
            extend_to_queue(m.formatted_queue)
            m.formatted_queue.clear()
            if m.ended is True:
                logger.log("Match with room id " + str(m.room_id) + " has concluded.", 1)
                matchs.remove(m)
        await send_to_central()
        await asyncio.sleep(UPDATE_DELAY)

async def handler(websocket):
    """Receives and handle incomming messages from websocket.

    Args:
        websocket (WebSocket): The WS to read from.
    """
    try:
        async for message in websocket:
            event = json.loads(message)
            if event["type"] == "ping":
                pass #on est content on fait rien
            add_to_parse(message)
    except Exception as e:
        logger.log("", 2, e)

def parser():
    """Receives and handle incomming messages from websocket.

    Args:
        websocket (WebSocket): The WS to read from.
    """
    with lock:
        for message in parse_queue:
            event = json.loads(message)
            if event["type"] == "ping":
                pass #on est content on fait rien
            elif event["type"] == "join":
                logger.log("Join request from client ID ::" + str(event["id"]), 1)
                if not queue.add_to_queue(event):
                    add_to_queue(dump_error("already_in_queue", (int)(event["id"])))
                else:
                    add_to_queue(dump_join_queue((int)(event["id"])))
                    logger.log("Client ID " +  str(event["id"]) + " has joined Queue", 1)
            elif event["type"] == "quit":
                _id = (int)(event["id"])
                queue.del_from_queue(_id)
                logger.log("Client ID " + str(_id) + " manually exited queue.", 1)
                add_to_queue(dump_exit_queue(_id))
            elif event["type"] == "input" or \
                event["type"] == "ready" or event["type"] == "pause" or \
                event["type"] == "quit_lobby":
                room = (int)(event["room_id"])
                for m in matchs:
                    if m.room_id == room:
                        m.input(event)
                        break
            elif event["type"] == "spectate":
                room = (int)(event["room_id"])
                _id = (int)(event["id"])
                for m in matchs:
                    if m.room_id == room:
                        m.add_spectator(_id)
                    else:
                        m.remove_spectator(_id)
            elif event["type"] == "unspectate":
                for m in matchs:
                    m.remove_spectator(event["id"])
            elif event["type"] == "list_all":
                _id = (int)(event["id"])
                add_to_queue(dump_all_matchs(_id))
            elif event["type"] == "find_one":
                _id = (int)(event["id"])
                add_to_queue(search_for_player(_id))
            elif event["type"] == "dump_it_all_baby":
                _id = (int)(event["id"])
                add_to_queue(dump_everything(_id))
            else:
                add_to_queue(dump_error("unknown_command", (int)(event["id"])))
        parse_queue.clear()

async def main():
    """Opens up the server and starts listening on SERVER_PORT (by default 8001)
    """
    logger.log("Listener thread launched.", 0)
    async with serve(handler, "", SERVER_PORT, ping_interval=10,
                        ping_timeout=None, ssl=ssl_context):
        await asyncio.get_running_loop().create_future()  # run forever
    Sockets.STOP_FLAG = True

async def connection_handler():
    """Loop that handles connection to central server. 

    Sleeps for 5 seconds, and sends a ping to the server. If the server isn't
    connected, attempts to connect instead.
    """
    while Sockets.STOP_FLAG is False:
        if Sockets.CENTRAL_SOCKET is None:
            try:
                logger.log("Attempting connection to central server.", 1)
                uri = "wss://172.17.0.1:" + str(CENTRAL_PORT) + "/"
                Sockets.CENTRAL_SOCKET = await connect(uri, ping_interval=10,
                                                       ping_timeout=None, ssl=ssl_client,
                                                       max_size=10485760, max_queue=256,
                                                       write_limit=327680)
                logger.log("Central server connected.", 1)
            except Exception as e:
                Sockets.CENTRAL_SOCKET = None
                logger.log("Couldn't connect to the central server", 2, e)
        else:
            with lock:
                try:
                    await Sockets.CENTRAL_SOCKET.send(json.dumps(pong()))
                except Exception as e:
                    logger.log("", 2, e)
        await asyncio.sleep(5)

def connection_launcher():
    """Launches the connection handler as a asyncio task.
    """
    asyncio.run(connection_handler())

def server_launcher():
    """Launches the server handler as a asyncio task.
    """
    asyncio.run(main())

def ticker_launcher():
    """Launches the ticker handler as a asyncio task.
    """
    asyncio.run(loop())

def signal_handler(signal, frame):
    """Handles signals.

    Args:
        signal (_type_): _description_
        frame (_type_): _description_
    """
    Sockets.STOP_FLAG = True
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
    except Exception as e:
        logger.log("Server exited with manual closure.", 0, e)
