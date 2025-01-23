class UserSocket:
    def __init__(self, ws, id, bl):
        self._socket = ws
        self._id = id 
        self._blacklist = []
        for user in bl :
            list.append(user)

    def can_play_with(self, user):
        for bl in self.blacklist:
            if bl == user.id:
                return False
        return True
    
    @property
    def socket(self):
        return self._socket

    @socket.setter
    def socket(self, value):
        self._socket = value

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def blacklist(self):
        return self._blacklist

    @blacklist.setter
    def blacklist(self, value):
        self._blacklist = value