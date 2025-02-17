"""File for dumps"""

def dump_message(user, message):
    """Dumps a message. Contains user data and message content.

    Args:
        user (UserSocket): user data.
        message (string): message data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "message",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "content": message
    }
    return event

def sticker(user, img):
    """Dumps a sticker. Contains user data and image content.

    Args:
        user (UserSocket): user data.
        img (string): image data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "sticker",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "img": img
    }
    return event

def msg_private(user, sender, message):
    """Dumps a private message from sender to user.
    Contains both users data and message content.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.
        message (string): message data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "private_message",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "content": message
    }
    return event

def invite_friend(user, sender):
    """Dumps a friend invitation from sender to user.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "friend",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "method": "demand"
    }
    return event

def accept_friend(user, sender):
    """Dumps a friend invitation acceptance
    from sender to user.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "friend",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "method": "accept"
    }
    return event

def refuse_friend(user, sender):
    """Dumps a friend invitation refusal
    from sender to user.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "friend",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "method": "refuse"
    }
    return event

def cancel_friend(user, sender):
    """Dumps a friend invitation cancelation
    from sender to user.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "friend",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "method": "cancel"
    }
    return event

def remove_friend(user, sender):
    """Dumps a friend invitation removal
    from sender to user.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "friend",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "method": "remove"
    }
    return event

def msg_private_sticker(user, sender, img):
    """Dumps a private sticker from sender to user.
    Contains both users data and image content.

    Args:
        user (UserSocket): user data.
        sender (UserSocket) : sender data.
        img (string): image data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "private_sticker",
        "server": "main",
        "name": user.name,
        "id": user.id,
        "sender": sender.id,
        "sender_name": sender.name,
        "img": img
    }
    return event

def msg_room(user, room, game, message):
    """Dumps a message to a game room.
    Contains user data and message content.

    Args:
        user (UserSocket): user data.
        room (int) : ID of the room.
        game (string) : game type of the room.
        message (string): message data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "salon_message",
        "server": "main",
        "room_id": room,
        "game": game,
        "name": user.name,
        "id": user.id,
        "content": message
    }
    return event

def msg_room_sticker(user, room, game, img):
    """Dumps a message to a game room.
    Contains user data and image content.

    Args:
        user (UserSocket): user data.
        room (int) : ID of the room.
        game (string) : game type of the room.
        img (string): image data.

    Returns:
        dict: dumped data.
    """
    event = {
        "answer": "yes",
        "type": "salon_sticker",
        "server": "main",
        "room_id": room,
        "game": game,
        "name": user.name,
        "id": user.id,
        "img": img
    }
    return event
