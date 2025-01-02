import Match2
import Socket
import json
import time

class Queue:
    def __init__(self, start):
        self._liste = []
        self._private = []
        self._room_id = -1
        self._start = start

    def add_to_queue(self, ws, message):
        try:
            id = (int)(message["id"])
            bl = message["blacklist"]
            for user in self._liste:
                if user.id == id:
                    return False
            sock = Socket.UserSocket(ws, id, bl)
            if (message["private"] == "invite"):
                self._room_id += 1
                match = Match2.Match2(self._room_id, id, 0, ws, None)
                match.load_parameters(id, ws, message["payload"])
                self._private.append(match)
            elif (message["private"] == "join"):
                id = (int)(message["invited_by"])
                for private in self._private:
                    if private.player_1_paddle.id == id:
                        private.join_player(ws)
                        break
            else:
                self._liste.append(sock)
            return True
        except:
            curr = time.time() - self._start
            print("[", curr, "] : Missing value found while parsing. Ignoring.")
    
    def del_from_queue(self, id):
        for us in self._liste:
            if us.id == id:
                self._liste.remove(us) 

    async def notify_waiting(self):
        event = {
            "type" :"wait"
        }
        for user in self._liste:
            try:
                await user.socket.send(json.dumps(event))
            except:
                self._liste.remove(user)

    async def tick(self):
        if len(self._liste) >= 2:
            for p1 in self._liste:
                for p2 in self._liste:
                    if (p1.id != p2.id):
                        self._room_id += 1
                        self.del_from_queue(p1.id)
                        self.del_from_queue(p2.id)
                        print("[Event] Created match room for players ", p1.id, ":", p2.id, " with Room ID :", self._room_id)
                        return Match2.Match2(self._room_id, p1.id, p2.id, p1.socket, p2.socket)
        for private in self._private:
            private.tick()
            if private.needs_to_wait is False:
                self._private.remove(private)
                return private
        await self.notify_waiting()
        return None

    @property
    def liste(self):
        return self._liste

    @liste.setter
    def liste(self, value):
        self._liste = value

    @property
    def private(self):
        return self._private

    @private.setter
    def private(self, value):
        self._private = value

    @property
    def room_id(self):
        return self._room_id

    @room_id.setter
    def room_id(self, value):
        self._room_id = value

    @property
    def start(self):
        return self._start

    @start.setter
    def start(self, value):
        self._start = value