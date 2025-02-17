"""A class to handle queues."""

import threading
from match import Match
from user import User

class Queue:
    """A class to handle queues for matchmaking.
    """
    def __init__(self, logger):
        self._liste = []
        self._private = []
        self._room_id = 0
        self._logger = logger
        self._message_queue = []
        self._match_list = []
        self._lock = threading.Lock()

    def add_to_queue(self, message):
        """Adds a user to queue.

        Args:
            message (dict): data of the query.

        Returns:
            bool: True if the user was added to the queue, False otherwise.
        """
        try:
            with self._lock:
                _id = (int)(message["id"])
                bl = message["blacklist"]
                for user in self._liste:
                    if user.id == _id:
                        return False
                user = User(_id, bl)
                if message["private"] == "invite":
                    invited = int(message["invited"])
                    self._room_id += 1
                    match = Match(self._room_id, _id, invited)
                    match.needs_to_wait = True
                    match.load_parameters(message["payload"])
                    match.generate_invitation()
                    self._private.append(match)
                elif message["private"] == "join":
                    _id = (int)(message["invited_by"])
                    for private in self._private:
                        if private.paddle_1.id == _id:
                            private.join_player()
                            break
                elif message["private"] == "refuse":
                    _id = (int)(message["invited_by"])
                    for private in self._private:
                        if private.paddle_1.id == _id:
                            self._message_queue.append(self.dump_refusal(_id))
                            self._private.remove(private)
                            break
                else:
                    self._liste.append(user)
                return True
        except Exception as e:
            self._logger.log("", 2, e)
        return True

    def del_from_queue(self, _id):
        """Removes a player from the queue by his ID.

        Args:
            _id (int): ID of the player to remove.
        """
        for us in self._liste:
            if us.id == _id:
                self._liste.remove(us)

    def notify_waiting(self):
        """Generates the message queue.
        """
        i = 1
        for user in self._liste:
            event = {
                "server": "1v1_classic",
                "answer": "yes",
                "ids": [user.id],
                "type" : "wait",
                "data": {
                    "type" : "wait",
                    "id": user.id,
                    "position": i, 
                    "in_queue": len(self._liste)
                }
            }
            self._message_queue.append(event)
            i += 1

    def dump_refusal(self, _id):
        """Dumps the refusal event.

        Returns:
            dict : refusal event.
        """
        event = {
            "server": "1v1_classic",
            "answer": "yes",
            "ids": [_id],
            "type" : "wait",
            "data": {
                "type" : "refusal",
                "id": _id
            }
        }
        return event

    def tick(self):
        """Ticks the queue, creating matches if two compatible
        players are waiting.
        """
        with self._lock:
            if len(self._liste) >= 2:
                for p1 in self._liste:
                    for p2 in self._liste:
                        if (p1.id != p2.id and p1.can_play_with(p2)):
                            self._room_id += 1
                            self.del_from_queue(p1.id)
                            self.del_from_queue(p2.id)
                            text = "Created match room for players " + str(p1.id) + ":" \
                                + str(p2.id) + " with Room ID :" + str(self._room_id)
                            self._logger.log(text, 1)
                            self._match_list.append(Match(self._room_id, p1.id, p2.id))
            for private in self._private:
                private.tick()
                self._message_queue.extend(private.formatted_queue)
                private.formatted_queue.clear()
                if private.needs_to_wait is False:
                    self._private.remove(private)
                    self.match_list.append(private)
            self.notify_waiting()

    @property
    def liste(self):
        """returns the list of waiting players.

        Returns:
            dict: list of waiting players.
        """
        return self._liste

    @liste.setter
    def liste(self, value):
        self._liste = value

    @property
    def private(self):
        """Returns the private waiting queue.

        Returns:
            dict: list of private waiting matches.
        """
        return self._private

    @private.setter
    def private(self, value):
        self._private = value

    @property
    def room_id(self):
        """Returns the highest room ID.

        Returns:
            int: Highest room ID.
        """
        return self._room_id

    @room_id.setter
    def room_id(self, value):
        self._room_id = value

    @property
    def message_queue(self):
        """Returns the message queue.

        Returns:
            dict: the message queue.
        """
        return self._message_queue

    @message_queue.setter
    def message_queue(self, value):
        self._message_queue = value

    @property
    def match_list(self):
        """Returns the newly created matches list.

        Returns:
            dict: list of matches.
        """
        return self._match_list

    @match_list.setter
    def match_list(self, value):
        self._match_list = value
