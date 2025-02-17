"""Main file for central server."""
#!/usr/bin/env python

import asyncio
import time
import json
import random
import string
import signal
import pathlib
import ssl
import os
from signal import SIGPIPE, SIG_DFL
from dataclasses import dataclass
from websockets.asyncio.server import serve
from websockets.asyncio.client import connect
from user import User
from logger import Logger
signal.signal(SIGPIPE,SIG_DFL)

start = time.time()
userList = []
logList = []

SERVER_PORT         = os.environ.get("PORT_CENTRAL", 7777)
PORT_1V1_CLASSIC    = os.environ.get("PORT_1V1_CLASSIC", 8001)
PORT_2V2_CLASSIC    = os.environ.get("PORT_2V2_CLASSIC", 8003)
PORT_CHAT           = os.environ.get("PORT_CHAT", 7878)
DEBUG               = bool(os.environ.get("DEBUG", False))


@dataclass
class SocketData:
    """Dataclass for sockets.
    """
    SOCKET_CHAT = None
    SOCKET_1V1 = None
    SOCKET_2V2 = None
    STOP_FLAG = False

Sockets = SocketData

#starts the logger
logger = Logger()

#loads up ssl crap
localhost_pem = pathlib.Path("/etc/certs/cponmamju2.fr_key.pem")
ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(localhost_pem)
ssl_client = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ssl_client.load_verify_locations(localhost_pem)

def dump_health():
    """Dumps the status of the subprocesses sockets."""
    event = {
        "chat_server": Sockets.SOCKET_CHAT is not None,
        "1v1_classic_server": Sockets.SOCKET_1V1 is not None,
    }
    return event

def dump_player_status(_id):
    """Dumps the status of a player.

    Args:
        _id (int): identifier of the player

    Returns:
        dict | None: a dump of the player's status, or None if no player is bound to the ID.
    """
    for user in userList:
        if user.id == _id:
            return user.dump_status()
    return None

def dump_blacklist(_id, name, user):
    """Dumps the event of trying to send a message
    to a blacklisted user.

    Args:
        _id (int): id of the blacklisted user.
        user (User) : user sending the message

    Returns:
        dict | None: a dump of the evnet.
    """
    event = {
        "type": "blacklist",
        "name": name,
        "id" : _id,
        "block_id" : user.id,
        "block_name" : user.name
    }
    return event

def key_generator(size=36, chars=string.ascii_uppercase + string.digits):
    """Generates a random unique key identifier.

    Args:
        size (int, optional): amount of characters in the key. Defaults to 36.
        chars (_type_, optional): usable characters in the key. 
        Defaults to string.ascii_uppercase+string.digits.

    Returns:
        string: a randomly generated unique key.
    """
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

def key_check(_id, key):
    """Check if the given key matches the player's

    Args:
        _id (int): identifier of the player.
        key (string): the key to check.

    Returns:
        bool: True if the key matches the existing player, False otherwise.
    """
    for user in userList:
        if user.id == _id:
            if user.key == key:
                return True
            return False
    return False

def dump_all_users(me):
    """Returns a list of all logged in users.

    Args:
        me (int): id of the user calling the function.

    Returns:
        dict: dumped data.
    """
    event = {
        "type": "list_all_users",
        "data": []
    }
    for user in userList:
        if user.id != me:
            event["data"].append(user.dump_status())
    return event

def dump_all_friends(me, friends):
    """Dumps the status of the user's friends.

    Args:
        me (int): id of the user calling the function.
        friends (dict): list of int refering to the friends'
        IDs.

    Returns:
        dict: dumped list.
    """
    event = {
        "type": "list_all_friends",
        "id": me,
        "data": []
    }
    for _id in friends:
        for user in userList:
            if user.id == int(_id):
                event["data"].append(user.dump_status())
                break
        event["data"].append({
            "type": "status",
            "id": int(_id),
            "game": "offline",
            "status": "offline",
            "room": "offline"
        })
    return event

async def handler_1v1(event):
    """Handles 1v1 game answers.

    Args:
        event (dict): A list containing the query's data.
    """
    for id_f in event["ids"]:
        _id = (int)(id_f)
        data = event["data"]
        for user in userList:
            if user.id == _id:
                try:
                    if event["type"] == "list_all":
                        await user.send(json.dumps(event))
                    else:
                        await user.send(json.dumps(data))
                except Exception as e:
                    logger.log("Error while sending answer to user", 2, e)
                if data["type"] == "join_queue":
                    user.game = "1v1_classic"
                    user.status = "queue"
                    user.room = -1
                elif data["type"] == "exit_queue":
                    user.game = "none"
                    user.status = "here"
                    user.room = -1
                elif data["type"] == "match_init":
                    user.status = "playing"
                    user.room = int(data["room_id"])
                elif data["type"] == "match_start":
                    user.status = "playing"
                    user.room = int(data["room_id"])
                elif data["type"] == "victory":
                    user.game = "none"
                    user.status = "here"
                    user.room = -1

async def handler_2v2(event):
    """Handles 2v2 game answers.

    Args:
        event (dict): A list containing the query's data.
    """
    for id_f in event["ids"]:
        _id = (int)(id_f)
        data = event["data"]
        for user in userList:
            if user.id == _id:
                try:
                    if event["type"] == "list_all":
                        await user.send(json.dumps(event))
                    else:
                        await user.send(json.dumps(data))
                except Exception as e:
                    logger.log("Error while sending answer to user", 2, e)
                if data["type"] == "join_queue":
                    user.game = "2v2_classic"
                    user.status = "queue"
                    user.room = -1
                elif data["type"] == "exit_queue":
                    user.game = "none"
                    user.status = "here"
                    user.room = -1
                elif data["type"] == "match_init":
                    user.status = "playing"
                    user.room = int(data["room_id"])
                elif data["type"] == "match_start":
                    user.status = "playing"
                    user.room = int(data["room_id"])
                elif data["type"] == "victory":
                    user.game = "none"
                    user.status = "here"
                    user.room = -1

# Transfere la reponse du serveur au client
async def handle_answers(event):
    """Handles an answer; a query from a subprocess for a user.

    Args:
        event (dict): A list containing the query's data.
    """
    _type = event["type"]
    _server = event["server"]
    if _server == "1v1_classic":
        await handler_1v1(event)
    elif _server == "2v2_classic":
        await handler_2v2(event)
    elif _type == "message" or _type == "sticker":
        _id = (int)(event["id"])
        for user in userList:
            if user.id != _id and user.is_blacklisted(_id) is False:
                await user.send(json.dumps(event))
    elif _type == "salon_message" or _type == "salon_sticker":
        _id = (int)(event["id"])
        for user in userList:
            if user.game == event["game"] \
                        and user.room == (int)(event["room_id"]):
                await user.send(json.dumps(event))
    elif _type in ["private_message", "private_sticker"]:
        _id = (int)(event["id"])
        for user in userList:
            if user.id == _id and user.is_blacklisted(_id) is False:
                await user.send(json.dumps(event))
            elif user.is_blacklisted(_id) is True:
                for uss in userList:
                    if uss.id == event["sender"]:
                        await uss.send(json.dumps(dump_blacklist(_id, uss.name, user)))
                        break
    else:
        _id = (int)(event["id"])
        for user in userList:
            if user.id == _id:
                await user.send(json.dumps(event))

async def handle_transfer(event):
    """Handles a transfer; a query from the client to a subprocess.

    Args:
        event (List): A list containing the query's data.
    """
    _id = (int)(event["id"])
    _server = event["server"]
    #if event["type"] == "join":
    #    for user in userList:
    #        if user.id == _id:
    #            event["blacklist"] = user.blacklist
    #            break

    for user in userList:
        if user.id == _id:
            if user.key != event["key"]:
                logger.log("User with ID :: " + str(_id), 3, "Key not matching")
                return
            break
    if _server == "chat":
        for user in userList:
            if user.id == _id:
                event["room_id"] = int(user.room)
                event["game"] = user.game
                break
        try:
            await Sockets.SOCKET_CHAT.send(json.dumps(event))
        except Exception as e:
            logger.log("Error while sending to chat socket", 2, e)
            Sockets.SOCKET_CHAT = None

    elif _server == "1v1_classic":
        try:
            await Sockets.SOCKET_1V1.send(json.dumps(event))
        except Exception as e:
            logger.log("Error while sending to 1v1 Socket", 2, e)
            Sockets.SOCKET_1V1 = None

    elif _server == "2v2_classic":
        try:
            await Sockets.SOCKET_2V2.send(json.dumps(event))
        except Exception as e:
            logger.log("Error while sending to 2v2 Socket", 2, e)
            Sockets.SOCKET_2V2 = None

async def handle_log(websocket, event):
    """Handles a connecting user.

    Args:
        websocket (WebSocket): the websocket for the user.
        event (List): A list containing the query's data.
    """
    _id = (int)(event["id"])
    for user in userList:
        if user.id == _id:
            return
    flag = False
    for user in logList.copy():
        if user.id == _id:
            flag = True
            if event["socket"] == "input":
                user.sock_input = websocket
            elif event["socket"] == "output":
                user.sock_output = websocket
            if user.sock_input is not None and user.sock_output is not None:
                user.key = key_generator()
                logList.remove(user)
                userList.append(user)
                text = "Created user with ID ::" + str(user.id) + "\tKey ::" \
                    + str(user.key) + "\t Adress::" + str(user)
                logger.log(text, 1)
                await user.send(json.dumps(user.dump_key()))
                to_send = {
                    "type": "join_chat",
                    "id": user.id,
                    "name": user.name
                }
                await SocketData.SOCKET_CHAT.send(json.dumps(to_send))
            break
    if flag is False:
        user = User()
        user.id = _id
        user.name = event["name"]
        if event["socket"] == "input":
            user.sock_input = websocket
        elif event["socket"] == "output":
            user.sock_output = websocket
        logList.append(user)

async def disconnect_user(websocket):
    """Handle a disconnection (unepexted websocket closure)

    Args:
        websocket (WebSocket): the closed websocket.
    """
    for user in userList.copy():
        if websocket in [user.sock_input, user.sock_output]:
            logger.log("User " + str(user.name) + " (ID :" + str(user.id) \
                       +") has disconnected.", 1)
            if user.game == "1v1_classic":
                event = {
                    "type": "quit_lobby",
                    "id": user.id,
                    "room_id": user.room
                }
                try:
                    await SocketData.SOCKET_1V1.send(json.dumps(event))
                except Exception as e:
                    logger.log("", 2, e)
                    SocketData.SOCKET_1V1 = None
            if user.game == "2v2_classic":
                event = {
                    "type": "quit_lobby",
                    "id": user.id,
                    "room_id": user.room
                }
                try:
                    await SocketData.SOCKET_2V2.send(json.dumps(event))
                except Exception as e:
                    logger.log("", 2, e)
                    SocketData.SOCKET_2V2 = None
            event = {
                "type": "quit_chat",
                "id": user.id,
            }
            try:
                await SocketData.SOCKET_CHAT.send(json.dumps(event))
            except Exception as e:
                logger.log("", 2, e)
                SocketData.SOCKET_CHAT = None
            userList.remove(user)

async def handle_commands(websocket, event):
    """Handles central server commands.

    Args:
        websocket (WebSocket): Websocket of the querying client.
        event (List): A list containing the query's data.
    """
    _type = event["type"]
    _id = int(event["id"])

    if _type == "status":
        await websocket.send(json.dumps(dump_player_status(_id)))
    if _type == "all_user":
        await websocket.send(json.dumps(dump_all_users(_id)))
    if _type == "all_friends":
        await websocket.send(json.dumps(dump_all_friends(_id, event["friendlist"])))
    if _type == "all_blacklist":
        await websocket.send(json.dumps(dump_all_friends(_id, event["blacklist"])))
    if _type == "update":
        for user in userList:
            if user.id == _id:
                user.update(event["data"])
                break

async def handler(websocket):
    """Handles incomming messages from a websocket

    Args:
        websocket (WebSocket): _description_
    """
    try:
        async for message in websocket:
            event = json.loads(message)
            if event["type"] == "pong":
                pass
            elif event["type"] == "log":
                await handle_log(websocket, event)
            elif event["answer"] == "yes":
                await handle_answers(event)
            elif event["server"] != "main":
                await handle_transfer(event)
            else : #Commandes de serveur ...
                await handle_commands(websocket, event)
        await websocket.wait_closed()
    except Exception as e:
        logger.log("Error while reading data", 2, e)
    finally:
        await disconnect_user(websocket)

def ping():
    """Dumps a ping query.

    Returns:
        List: a ping query.
    """
    event = {
        "type": "ping"
    }
    return event

async def connection_handler():
    """Creates an infinite loop in a task that overwatches the 
    sockets to the subprocesses server. Should a connection fail,
    the loop will reconnect the subprocess.
    """
    displayed_welcome = False
    await asyncio.sleep(1)
    while Sockets.STOP_FLAG is False:
        if Sockets.SOCKET_CHAT is None:
            try:
                logger.log("Attempting connection to Chat server.", 1)
                uri = "wss://172.17.0.1:" + str(PORT_CHAT) + "/"
                Sockets.SOCKET_CHAT = await connect(uri, ping_interval=10, \
                                            ping_timeout=None, ssl=ssl_client)
                logger.log("Chat server connected.", 0)
            except Exception as e:
                Sockets.SOCKET_CHAT = None
                logger.log("Couldn't connect to the chat server.", 2, e)
        else:
            try:
                await Sockets.SOCKET_CHAT.send(json.dumps(ping()))
            except Exception as e:
                logger.log("Error while pinging chat server", 2, e)
                Sockets.SOCKET_CHAT = None

        if Sockets.SOCKET_1V1 is None:
            try:
                logger.log("Attempting connection to Game (1v1 Classical) server.", 1)
                uri = "wss://172.17.0.1:" + str(PORT_1V1_CLASSIC) + "/"
                Sockets.SOCKET_1V1 = await connect(uri, ping_interval=10, \
                                            ping_timeout=None, ssl=ssl_client)
                logger.log("Game (1v1 Classical) server connected.", 0)
            except Exception as e:
                Sockets.SOCKET_1V1 = None
                logger.log("Couldn't connect to the game (1v1 Classical) server.", 2, e)
        else:
            try:
                await Sockets.SOCKET_1V1.send(json.dumps(ping()))
            except Exception as e:
                logger.log("Error while pinging 1v1 game server", 2, e)
                Sockets.SOCKET_1V1 = None

        if Sockets.SOCKET_2V2 is None:
            try:
                logger.log("Attempting connection to Game (2v2 Classical) server.", 1)
                uri = "wss://172.17.0.1:" + str(PORT_2V2_CLASSIC) + "/"
                Sockets.SOCKET_2V2 = await connect(uri, ping_interval=10, \
                                            ping_timeout=None, ssl=ssl_client)
                logger.log("Game (2v2 Classical) server connected.", 0)
            except Exception as e:
                Sockets.SOCKET_2V2 = None
                logger.log("Couldn't connect to the game (2v2 Classical) server.", 2, e)
        else:
            try:
                await Sockets.SOCKET_2V2.send(json.dumps(ping()))
            except Exception as e:
                logger.log("Error while pinging 2v2 game server", 2, e)
                Sockets.SOCKET_2V2 = None
        await asyncio.sleep(3)
        if displayed_welcome is False:
            displayed_welcome = True
            logger.welcome()

async def server_listener():
    """Server functions. Listens for incomming connections through
    websockets.
    """
    logger.log("Listener task launched.", 1)
    async with serve(handler, "", SERVER_PORT, ping_interval=10, \
                     ping_timeout=None, ssl=ssl_context):
        await asyncio.get_running_loop().create_future()  # run forever
    Sockets.STOP_FLAG = True

def signal_handler(sig, frame):
    """Handles signals.

    Args:
        sig (_type_): _description_
        frame (_type_): _description_
    """
    logger.log(f"Received signal {sig} with frame {frame}, shutting down...", 0)
    loops = asyncio.get_event_loop()
    tasks = [t for t in asyncio.all_tasks(loops) if not t.done()]
    for task in tasks:
        task.cancel()
    loops.stop()

async def main():
    """Main async function that starts all tasks."""
    logger.log("Server launched.", 0)
    try:
        server_task = asyncio.create_task(server_listener())
        connection_task = asyncio.create_task(connection_handler())
        await asyncio.gather(server_task, connection_task)
    except asyncio.CancelledError:
        logger.log("Server shutdown initiated.", 0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    logger.log("Server launched.", 0)
    try:
        asyncio.run(main())
    except Exception as e:
        logger.log("Server exited with manual closure.", 0, e)
