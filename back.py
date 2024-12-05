import asyncio
import threading
import time
import itertools
import json
from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosedOK

timer = 0
ballPos = {0, 0}
color = 0xFF0000

def dump_ball_pos():
    global ballPos
    event = { 
        "type": "position",
        "target": "ball", 
        "x": ballPos[0],
        "y": ballPos[1],
    }
    return event

def dump_color():
    global color 
    event = {
        "type": "color",
        "target": "ball",
        "color": color,
        "action": "action",
    }
    return event

def dump_erro(error):
    event = {
        "type": "error",
        "target": "self",
        "content": error,
    }
    return event

def loop():
    global timer
    while True:
        timer += 1
        if (timer >= 10000000):
            timer = 0
        time.sleep(0.80)

async def handler(websocket):
    global timer, color, ballPos
    async for message in websocket:
        print("Action A")
        try:
            print("Action B")
            event = json.loads(message)
            print("Action C")
            if (event["type"] == "color"):
                print("Action COLOR")
                if (event["action"] == "change"):
                    print("At time : ", timer, ", Event : Changing color")
                    color = event["color"]
                elif (event["action"] == "get"):
                    print("At time : ", timer, ", Event : get color")
                    await websocket.send(json.dumps(dump_color()))
            elif (event["type"] == "ball"):
                print("Action BALL")
                if (event["action"] == "change"):
                    print("At time : ", timer, ", Event : Changing positions")
                    ballPos[0] = (int)(event["x"])
                    ballPos[1] = (int)(event["y"])
                elif (event["action"] == "get"):
                    print("At time : ", timer, ", Event : geting posiitons")
                    await websocket.send(json.dumps(dump_ball_pos()))
        except:
            print("bonjour")
            await websocket.send(json.dumps(dump_erro("bite")))

async def main():
    async with serve(handler, "", 8001):
        await asyncio.get_running_loop().create_future()  # run forever

if __name__ == "__main__":
    back = threading.Thread(target=loop, daemon=True)
    back.start()
    asyncio.run(main())
    back.join()
