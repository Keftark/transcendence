"""Simple user class."""

class User:
    """Simple user class.
    """
    def __init__(self, _id, bl):
        self._id = _id
        self._blacklist = []
        for user in bl :
            list.append(user)

    def can_play_with(self, user):
        """Checks wether the user can play with another,
        ie they're not on each other block list.

        Args:
            user (User): second user

        Returns:
            bool: True if the users can play together, False otherwise
        """
        for bl in self.blacklist:
            if bl == user.id:
                return False
        return True

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
    def blacklist(self):
        """Returns the blacklist of the user.

        Returns:
            dict: list of blacklisted users.
        """
        return self._blacklist

    @blacklist.setter
    def blacklist(self, value):
        self._blacklist = value
