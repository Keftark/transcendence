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
                self._liste.append(user)
                return True
        except Exception as e:
            self._logger.log("Error while adding user to queue", 2, e)
        return True

    def del_from_queue(self, _id):
        """Removes a player from the queue by his ID.

        Args:
            _id (int): ID of the player to remove.
        """
        for us in self._liste:
            if us.id == _id:
                self._liste.remove(us)

    async def notify_waiting(self):
        """Generates the message queue.
        """
        i = 1
        for user in self._liste:
            event = {
                "server": "2v2_classic",
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

    def check_compat(self, p1, p2, p3, p4):
        """Checks if the 4 players can play with each other.

        Args:
            p1 (User): User data for player 1.
            p2 (User): User data for player 2.
            p3 (User): User data for player 3.
            p4 (User): User data for player 4.

        Returns:
            bool: `True` if the 4 players can play together, `False` otherwise.
        """
        if p1.can_play_with(p2) is False or p1.can_play_with(p3) is False \
            or p1.can_play_with(p4) is False:
            return False
        if p2.can_play_with(p1) is False or p2.can_play_with(p3) is False \
            or p2.can_play_with(p4) is False:
            return False
        if p3.can_play_with(p2) is False or p3.can_play_with(p1) is False \
            or p3.can_play_with(p4) is False:
            return False
        if p4.can_play_with(p2) is False or p4.can_play_with(p3) is False \
            or p4.can_play_with(p1) is False:
            return False
        return True

    def check_unicity(self, p1, p2, p3, p4):
        """Checks if the 4 players are distinct from each other.

        Args:
            p1 (User): User data for player 1.
            p2 (User): User data for player 2.
            p3 (User): User data for player 3.
            p4 (User): User data for player 4.

        Returns:
            bool: `True` if the 4 players can play together, `False` otherwise.
        """
        if p1.id in [p2.id, p3.id, p4.id]:
            return False
        if p2.id in [p3.id, p4.id]:
            return False
        if p3.id == p4.id:
            return False
        return True

    def generate_queue(self):
        """Gather 4 players and check if they can play together.
        """
        for p1 in self._liste:
            for p2 in self._liste:
                for p3 in self._liste:
                    for p4 in self._liste:
                        if self.check_unicity(p1, p2, p3, p4) \
                            and self.check_compat(p1, p2, p3, p4):
                            self._room_id += 1
                            self.del_from_queue(p1.id)
                            self.del_from_queue(p2.id)
                            self.del_from_queue(p3.id)
                            self.del_from_queue(p4.id)
                            text = "Created match room for players " + str(p1.id) + ":" \
                                + str(p3.id) + " VS " + str(p2.id) + ":" + str(p4.id) \
                                + " with Room ID :" + str(self._room_id)
                            self._logger.log(text, 1)
                            self._match_list.append \
                                (Match(self._room_id, p1.id, p2.id, p3.id, p4.id))

    async def tick(self):
        """Ticks the queue, creating matches if four compatible
        players are waiting.
        """
        with self._lock:
            if len(self._liste) >= 4:
                self.generate_queue()
            for private in self._private:
                private.tick()
                if private.needs_to_wait is False:
                    self._private.remove(private)
                    self.match_list.append(private)
                self._message_queue.extend(private.formatted_queue)
            await self.notify_waiting()

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
