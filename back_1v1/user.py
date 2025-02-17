"""Simple user class."""

class User:
    """Simple user class.
    """
    def __init__(self, _id = 0, bl = None):
        self._id = _id
        self._blacklist = []
        for user in bl :
            self._blacklist.append(int(user))
        print(f"User {_id} blacklist is {self._blacklist}")

    def can_play_with(self, user):
        """Checks wether the user can play with another,
        ie they're not on each other block list.

        Args:
            user (User): second user

        Returns:
            bool: True if the users can play together, False otherwise
        """
        for bl in self.blacklist:
            print(f"Looking at id {bl}")
            if int(bl) == user.id:
                print("User is found blacklisted")
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
