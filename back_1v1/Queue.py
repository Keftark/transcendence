from Match import Match
from User import User
from Socket import UserSocket
import json
import time

class Queue:
    def __init__(self, start):
        self._liste = []
        self._private = []
        self._room_id = -1
        self._start = start
        self._message_queue = []
        self._match_list = []
        self._ws = None

    def set_ws(self, ws):
        self._ws = ws

    def add_to_queue(self, message, ws):
        try:
            id = (int)(message["id"])
            bl = message["blacklist"]
            for user in self._liste:
                if user.id == id:
                    return False
            user = UserSocket(ws, id, bl)
            if (message["private"] == "invite"):
                self._room_id += 1
                match = Match(self._room_id, id, 0)
                match.set_private_match()
                match.load_parameters(message["payload"])
                self._private.append(match)
            elif (message["private"] == "join"):
                id = (int)(message["invited_by"])
                for private in self._private:
                    if private.player_1_paddle.id == id:
                        private.join_player()
                        break
            else:
                self._liste.append(user)
            return True
        except Exception as e:
            curr = time.time() - self._start
            print("[", curr, "] : Got error", e, ".")
    
    def del_from_queue(self, id):
        for us in self._liste:
            if us.id == id:
                self._liste.remove(us) 

    async def notify_waiting(self):
        for user in self._liste:
            event = {
                "type" :"wait",
                "id": user.id,
                "server": "1v1_classic",
                "answer": "yes",
            }
            #self._message_queue.append(event)
            try:
                await self._ws.send(json.dumps(event))
            except Exception as e:
                print("Caca ::", e)

    async def tick(self):
        if len(self._liste) >= 2:
            for p1 in self._liste:
                for p2 in self._liste:
                    if (p1.id != p2.id and p1.can_play_with(p2)):
                        self._room_id += 1
                        self.del_from_queue(p1.id)
                        self.del_from_queue(p2.id)
                        print("[Event] Created match room for players ", p1.id, ":", p2.id, " with Room ID :", self._room_id)
                        self._match_list.append(Match(self._room_id, p1.id, p2.id, p1.ws))
        for private in self._private:
            private.tick()
            if private.needs_to_wait is False:
                self._private.remove(private)
                self.match_list.append(private)
            self._message_queue.extend(private.formatted_queue)
        await self.notify_waiting()

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

    @property
    def message_queue(self):
        return self._message_queue

    @message_queue.setter
    def message_queue(self, value):
        self._message_queue = value

    @property
    def match_list(self):
        return self._match_list

    @match_list.setter
    def match_list(self, value):
        self._match_list = value