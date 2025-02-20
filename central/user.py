"""Simple class to store user data."""

class User:
    """Simple class to store user data.
    """
    def __init__(self):
        self._sock_input = None
        self._sock_output = None
        self._id = 0
        self._name = ""
        self._status = "here"
        self._game = "none"
        self._room = -1
        self._key = ""
        self._blacklist = []

    def dump_key(self):
        """Dumps the key.

        Returns:
            dict: dump of the key.
        """
        event = {
            "id": self._id,
            "key": self._key
        }
        return event

    def dump_status(self):
        """Dumps the status of the user.

        Returns:
            dict: dump of the status.
        """
        event = {
            "type": "status",
            "id": self._id,
            "game": self._game,
            "status": self._status,
            "room": self._room
        }
        return event

    def update(self, payload):
        """Update the User's value from the data dict.

        Args:
            payload (dict): Data to update
        """
        for data in payload:
            match data:
                case "name":
                    self._name = payload[data]
                case "blacklist":
                    self._blacklist = payload[data]

    async def send(self, data):
        """Sends the data to the user's ouput websocket.

        Args:
            data (dict): A json dump of the data to send.
        """
        try:
            await self._sock_output.send(data)
        except Exception as e:
            print(e)
            self._sock_output = None

    def is_blacklisted(self, _id):
        """Returns wether the ID belongs to the user's
        blacklist.

        Args:
            _id (int): ID of the potentially blacklisted user.

        Returns:
            bool: `True` if the user is blacklisted, `False` otherwise.
        """
        for bl in self._blacklist:
            if bl == _id:
                return True
        return False

    async def disconnect(self):
        """Properly handles disconnection.
        """
        try:
            await self._sock_input.close()
        except:
            pass
        try:
            await self._sock_output.close()
        except:
            pass

    @property
    def sock_input(self):
        """Returns the input websocket.

        Returns:
            WebSocket | None: Websocket used for the input.
        """
        return self._sock_input

    @sock_input.setter
    def sock_input(self, value):
        self._sock_input = value

    @property
    def sock_output(self):
        """Returns the output websocket.

        Returns:
            WebSocket | None: Websocket used for the output.
        """
        return self._sock_output

    @sock_output.setter
    def sock_output(self, value):
        self._sock_output = value

    @property
    def id(self):
        """Returns the ID of the user.

        Returns:
            int: ID of the user.
        """
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def name(self):
        """Returns the name of the user.

        Returns:
            string: the name of the user.
        """
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def status(self):
        """Returns the status of the user.

        Returns:
            String: Status of the user.
        """
        return self._status

    @status.setter
    def status(self, value):
        self._status = value

    @property
    def key(self):
        """Returns the key of the user.

        Returns:
            String: key of the user.
        """
        return self._key

    @key.setter
    def key(self, value):
        self._key = value

    @property
    def game(self):
        """Returns the current game of the user.

        Returns:
            String: current game of the user.
        """
        return self._game

    @game.setter
    def game(self, value):
        self._game = value

    @property
    def room(self):
        """Returns the room id of the user.

        Returns:
            int: room id of the user.
        """
        return self._room

    @room.setter
    def room(self, value):
        self._room = value

    @property
    def blacklist(self):
        """Returns the blacklist of the user.

        Returns:
            dict: blacklist of the user.
        """
        return self._blacklist

    @blacklist.setter
    def blacklist(self, value):
        self._blacklist = value
