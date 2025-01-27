"""UserSocket class to store user data"""

class UserSocket:
    """UserSocket class. stores various data for users.
    """
    def __init__(self, _id, nm):
        self._id = _id
        self._name = nm

    @property
    def id(self):
        """Returns the user's ID.

        Returns:
            int: user's ID.
        """
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def name(self):
        """Returns the user's name.

        Returns:
            string: user's name.
        """
        return self._name

    @name.setter
    def name(self, value):
        self._name = value
