Un serveur qui gere les chats. Miaou.

### Connexion
Pour rejoindre le salon de chat, la requete suivante doit etre envoyee :
* `type`: `join_chat`
* `id` : `int` réfère a l'ID du client.
* `name` : `string` définissant le nom de l'utilisateur. Sert de racourci pour éviter des requêtes a la bdd.
* `blacklist` : une liste `{}` d'entiers faisant références aux IDs blacklistés par le joueur.

### Deconnexion
Pour quitter le salon de chat, la requete suivante doit etre envoyee :
* `type`: `quit_chat`
* `id` : `int` réfère a l'ID du client.

### Message
Pour envoyer un message general, la requete suivante doit etre envoyee :
* `type`: `message`
* `id` : `int` réfère a l'ID du client.
* `content` : `string` contenant le corps du message.

La reponse suivante sera alors envoyee a tous les clients connectes :
* `type`: `message`
* `id` : `int` réfère a l'ID du client ayant envoye le message.
* `name` : `string` réfère au nom du client ayant envoye le message.
* `content` : `string` contenant le corps du message.

### Sticker
Pour envoyer un sticker/image, la requete suivante doit etre envoyee :
* `type`: `sticker`
* `id` : `int` réfère a l'ID du client.
* `img` : `int` contenant l'ID du sticker.

La reponse suivante sera alors envoyee a tous les clients connectes :
* `type`: `sticker`
* `id` : `int` réfère a l'ID du client ayant envoye le message.
* `name` : `string` réfère au nom du client ayant envoye le message.
* `img` : `int` contenant l'ID du sticker.

### Message privee
Pour envoyer un message privee, la requete suivante doit etre envoyee :
* `type`: `private_message`
* `id` : `int` réfère a l'ID du client qui a envoyé le message.
* `target` : `int` réfère a l'ID du destinataire du message.
* `content` : `string` contenant le corps du message.

La reponse suivante sera alors envoyee au client concerne :
* `type`: `private_message`
* `id` : `int` réfère a l'ID du destinataire du message.
* `name` : `string` réfère au nom du destinataire du message.
* `sender` : `int` réfère a l'ID du destinataire du message.
* `sender_name` : `string` réfère au nom du destinataire du message.
* `content` : `string` contenant le corps du message.


### Sticker de Salon
Pour envoyer un sticker en message privee, la requete suivante doit etre envoyee :
* `type`: `private_sticker`
* `id` : `int` réfère a l'ID du client qui a envoyé le message.
* `target` : `int` réfère a l'ID du destinataire du message.
* `img` : `int` contenant l'ID du sticker.

La reponse suivante sera alors envoyee au client concerne :
* `type`: `private_sticker`
* `id` : `int` réfère a l'ID du destinataire du message.
* `name` : `string` réfère au nom du destinataire du message.
* `sender` : `int` réfère a l'ID du destinataire du message.
* `sender_name` : `string` réfère au nom du destinataire du message.
* `img` : `int` contenant l'ID du sticker.

### Message de salon
Pour envoyer un message au salon de jeu, la requete suivante doit etre envoyee :
* `type`: `salon_message`
* `id` : `int` réfère a l'ID du client.
* `content` : `string` contenant le corps du message.

La reponse suivante sera alors envoyee au client concerne :
* `type`: `salon_message`
* `id` : `int` réfère a l'ID du client ayant envoye le message.
* `room_id` : `int` réfère a l'ID du salon.
* `content` : `string` contenant le corps du message.

### Sticker de Salon
Pour envoyer un sticker au salon de jeu, la requete suivante doit etre envoyee :
* `type`: `salon_sticker`
* `id` : `int` réfère a l'ID du client.
* `img` : `int` contenant l'ID du sticker.

La reponse suivante sera alors envoyee au client concerne :
* `type`: `salon_sticker`
* `id` : `int` réfère a l'ID du client ayant envoye le message.
* `room_id` : `int` réfère a l'ID du salon.
* `img` : `int` contenant l'ID du sticker.