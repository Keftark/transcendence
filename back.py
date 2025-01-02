#!/usr/bin/env python

import asyncio
import threading
import time
import json
import Socket
import os
import Queue
import websockets
from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosedOK, ConnectionClosed

#Take the variables from the .env
#Leave as comments until we are in docker !
# UPDATES_PER_SECOND = os.environ["UPDATES_PER_SECOND"]
# SERVER_PORT = os.environ["PORT_1V1_CLASSIC"]

#Hardcoded variables, to delete when in docker
UPDATE_DELAY = 0.016
SERVER_PORT = 8001

SOCKLIST = set()

start = time.time()
queue = Queue.Queue(start)
matchs = []
stopFlag = False

def dump_error(error):
    event = {
        "type": "error",
        "content": error,
    }
    return event

def dump_exit_queue(id):
    event = {
        "type": "exit_queue",
        "id": id
    }
    return event

def dump_all_matchs():
    event = []
    for m in matchs:
        details = {
            "room_id": m.room_id,
            "id_p1": m.player_1_paddle.id,
            "id_p2": m.player_1_paddle.id
        }
        event.append(details)
    return event

def search_for_player(id):
    for m in matchs:
        if m.player_1_paddle.id == id or m._player_2_paddle.id == id:
            event = {
                "type": "search_request",
                "result": "found_in_match",
                "room_id": m.room_id
            }
            return event
    for q in queue.liste:
        if q.id == id:
            event = {
                "type": "search_request",
                "result": "found_in_queue",
            }
            return event
    event = {
        "type": "search_request",
        "result": "not_found"
    }
    return event

def dump_everything():
    global start
    event = {
        "port": SERVER_PORT,
        "tick_rate": UPDATE_DELAY,
        "execution_time": time.time() - start,
        "in_queue": len(queue.liste),
        "matches": len(matchs),
        "author": "nmascrie"
    }
    return event

async def loop():
    global queue, matchs, stopFlag, start
    curr = time.time() - start
    print("[", curr, "] : Ticker thread launched.")
    while True:
        #update all matches
        for m in matchs:
            await m.tick()
            if m.ended:
                curr = time.time() - start
                print("[", curr, "] : Match with room id", m.room_id ,"has concluded.")
                matchs.remove(m)
        found = await queue.tick()
        if found is not None:
            matchs.append(found)
        time.sleep(UPDATE_DELAY)

async def handler(websocket):
    global start, queue
    async for message in websocket:
        try:
            event = json.loads(message)
            if (event["type"] == "join"):
                curr = time.time() - start
                print("[", curr, "] : Join request from client ID", event["id"])
                if (not queue.add_to_queue(websocket, event)):
                    await websocket.send(json.dumps(dump_error("already_in_queue")))
                else:
                    curr = time.time() - start
                    print("[", curr, "] : client ID", event["id"], "has joined Queue")
            elif (event["type"] == "quit"):
                id = (int)(event["id"])
                queue.del_from_queue(id)
                curr = time.time() - start
                print("[", curr, "] : client ID", id, "manually exited queue.")
                await websocket.send(json.dumps(dump_exit_queue(id)))
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
                await websocket.send(json.dumps(dump_all_matchs()))
            elif (event["type"] == "find_one"):
                id = (int)(event["id"])
                await websocket.send(json.dumps(search_for_player(id)))
            elif (event["type"] == "dump_it_all_baby"):
                await websocket.send(json.dumps(dump_everything()))
            else:
                await websocket.send(json.dumps(dump_error("unknown_command")))
        except:
            curr = time.time() - start
            print("[", curr, "] : Error occured while reading json")
            await websocket.send(json.dumps(dump_error("fatal_error")))


async def main():
    global stopFlag, start
    curr = time.time() - start
    print("[", curr, "] : Listener thread launched.")
    async with serve(handler, "", SERVER_PORT):
        await asyncio.get_running_loop().create_future()  # run forever

def launcher2():
    asyncio.run(main())

def launcher():
    asyncio.run(loop())

if __name__ == "__main__":
    start = time.time()
    curr = time.time() - start
    print("[", curr, "] : Server launched.")
    try:
        back = threading.Thread(target=launcher)
        front = threading.Thread(target=launcher2)
        back.start()
        front.start()
        #asyncio.run(main())
        back.join()
        front.join()
    except:
        curr = time.time() - start
        print("[", curr, "] : Server exited with manual closure.")
