import json

class User:
    def __init__(self):
        self._sock_input = None
        self._sock_output = None
        self._id = 0
        self._name = ""
        self._status = "here"
        self._room = -1
        self._key = ""
    
    def dump_key(self):
        event = {
            "id": self._id,
            "key": self._key
        }
        return event

    async def send(self, data):
        try:
            await self._sock_output.send(data)
        except Exception as e:
            print(e)
            self._sock_output = None

    @property
    def sock_input(self):
        return self._sock_input

    @sock_input.setter
    def sock_input(self, value):
        self._sock_input = value

    @property
    def sock_output(self):
        return self._sock_output

    @sock_output.setter
    def sock_output(self, value):
        self._sock_output = value

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        self._status = value

    @property
    def key(self):
        return self._key

    @key.setter
    def key(self, value):
        self._key = value

    @property
    def room(self):
        return self._room

    @room.setter
    def room(self, value):
        self._room = value
