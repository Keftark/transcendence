# Comment ça marche ?
Un joueur envoie une demande de queue. Un objet socket est crée; ce dernier stocke l'adresse de sa websocket, son ID, ainsi que la liste des ID blacklistées.
```Python
class UserSocket:
    def __init__(self, ws, id, bl):
        self.socket = ws
        self.id = id 
        self.blacklist = []
        for user in bl :
            list.append(user)
```
Cet socket est ensuite placée dans la queue. 

Un thread est lancé en parrallèle, nommé ticker. Toutes les `UPDATE_DELAY` (par défaut, 0.016 secondes, soit 60x par secondes), on `tick()` notre queue. Lors d'un tick, on vérifie pour chaque socket enregistrée s'il existe des sockets compatibles, c'est à dire dont leurs ID ne figure pas dans la blacklist de notre socket. S'il existe bel et bien une telle socket, ces deux sont retirées de la queue, et envoyée dans un objet `Match`.

L'objet Match est plus complexe, et possède luis aussi un `tick()`. Une fois que les deux joueurs ont envoyé une requête `ready`, le match peut commencer. `tick()` va calculer et mettre à jour la position de la balle et de la raquette du joueur. A chaque tick, une requête est envoyé vers le client, contenant toutes les positions de balle et des raquettes.

Lorsqu'un but est marqué, une requête but est envoyé au client, la balle est remise au centre, et le jeu remis en pause, jusqu'a la reception d'une requête `ready` des deux clients. 

Lorsque le nombre de but maximum est atteint, où si le chrono est écoulé, une requête de fin de match, contenant les données de victoire, est envoyé aux clients, et le Match est supprimé. 

# Requêtes
Absolument toutes les requêtes envoyées au serveur doivent avoir au minimum les champs suivants :
* `type`:`string` définissant le type de requête
* `id`:`int` étant l'ID du joueur faisant la requête. 

Toutes les réponses du serveur contiennent obligatoirement le champ `type`. 

### Rejoindre la queue
Requête : 
* `type` : `join` pour rejoindre la queue.
* `id`
* `blacklist` : une liste `{}` d'entiers faisant réfénces aux IDs blacklistés par le joueur.
* `private` : définit si le match est privé ou non. Il peut avoir trois valeurs :
  * `invite` : crée une salle privée. 
  * `join` : rejoint une salle privée.
  * `none` : rejoint la queue de manière simple (matchmaking). Si la valeur de `private` vaut autre chose que ces trois valeurs, `private` sera traité comme valant `none`.
* `invited` : un `int` faisant reference au joueur invite
* `invited_by` : un `int` faisant référence au joueur ayant crée la salle privée. Obligatoire uniquement si `private` vaut `join`.
* `payload` : une liste `{}` contenant les réglages du match. Obligatoire uniquement si `private` vaut `invite`. Toutes les valeurs de la liste sont obligatoires.
  * `id_p1` réfère au joueur ayant crée la salle. Il doit donc être égale a `id` !
  * `id_p2` réfère au joueur invité. 
  * `point` : `int` signifiant l'objectif de score.
  * `board_x` : `int` indiquant la valeur x maximale du terrain de jeu. 
  * `board_y` : `int` indiquant la valeur y maximale du terrain de jeu. 
  * `ball_radius` : `float` indiquant le rayon de la balle.
  * `ball_speed` : `float` indiquant la valeur de départ de la vitesse de la balle.
  * `ball_increment` : `float` indiquant la valeur d'incrémentation de la vitesse de la balle a chaque rebond.
  * `max_time` : `int` indiquant la durée maximum du match, en secondes. Si cette valeur est mise a -1, le timer sera infini.

Voici un exemple valide de requête :
```json
{
    "type": "join",
    "id": 8,
    "blacklist": {9, 18, 7},
    "private": "invite",
    "invited_by": 0,
    "payload": { 
        "id_p1": 8,
        "id_p2": 5,
        "point": 5,
        "board_x": 40,
        "board_y": 25,
        "ball_radius": 0.8,
        "ball_speed": 0.5,
        "ball_increment": 0.05,
        "max_time": 300
    },
}
```
#### Réponse
Aucune réponse si la requête abouti. Si le joueur est déjà dans la queue, la réponse suivante est envoyée :
* `type`: `error`
* `content`: `already_in_queue`

### Quitter la queue
Requête :
* `type`: `quit`
* `id`

Quitte la queue. Aucun effet si le joueur est déjà dans un match. Aucune réponse.

### Initialisation de match
Lorsqu'une salle est crée, la réponse suivante est envoyée au client :
* `type`: `match_init`
* `room_id` : `int` réfère a l'ID de la salle. Cette valeur doit être sauvegardé, c'est elle qui permets de faire des requêtes a la salle en question !
* `id_p1` : réfère au joueur à gauche du tableau.
* `id_p2` : réfère au joueur à droite du tableau.

### Attente du joueur 2
Lorsqu'une salle privée est crée, et que le joueur 1 est en attente de l'arrivée, la réponse suivante est envoyée à chaque tick :
* `type`: `wait_start_invited`
* `room_id` : `int` réfère a l'ID de la salle.
* `p1_state` : `boolean` valant `true` si le joueur à gauche est prêt, `false` sinon.
* `p2_state` : `boolean` valant `true` si le joueur à droite est prêt, `false` sinon.

### Spectateurs de match
Requête pour rejoindre un match en tant que spectateur :
* `type`: `spectate`
* `room_id` : ID du match.

Pour quitter le match :
* `type`: `unspectate`

### Attente de départ
Lorsque la salle est initialisée, mais que le match n'as pas encore commencé, la réponse suivante est envoyée à chaque tick :
* `type`: `wait_start`
* `room_id` : `int` réfère a l'ID de la salle.
* `p1_state` : `boolean` valant `true` si le joueur à gauche est prêt, `false` sinon.
* `p2_state` : `boolean` valant `true` si le joueur à droite est prêt, `false` sinon.


### Départ de match
Lorque le match démarre, c'est à dire que la balle commence a bouger pour la première fois, la réponse suivante est envoyée :
* `type`: `match_start`
* `room_id` : `int` réfère a l'ID de la salle.

### Appel de préparation
Lorsque qu'un but est marqué, les deux joueurs doivent appuyer sur le bouton prêt pour que la partie se continue. Lorsque la match est en attente de cette préparation, la réponse suivante est envoyée à chaque tick :
* `type`: `wait_ready`
* `room_id` : `int` réfère a l'ID de la salle.
* `p1_state` : `boolean` valant `true` si le joueur à gauche est prêt, `false` sinon.
* `p2_state` : `boolean` valant `true` si le joueur à droite est prêt, `false` sinon.

Pour qu'un joueur se désigne prêt, la requête suivante doit être envoyée :
* `type`: `ready`
* `id`
* `room_id`: `int` réfère a l'ID de la salle.

Cette requête ne génère pas de réponse, mais l'état de l'appel de préparation sera changé. 

### Mise en pause
Un joueur peut mettre le match en pause avec la requête suivante :
* `type`: `pause`
* `id`
* `room_id`: `int` réfère a l'ID de la salle.

Le match passera en mode appel de préparation dans cette situation. 

### Quitter un match
Un joueur peut quitter un match en envoyant la requête suivante :
* `type`: `quit_lobby`
* `id`
* `room_id`: `int` réfère a l'ID de la salle.

Quitter un match occasionnera une réponse de victoire. 

### Réponses de victoires
A la fin d'un match, une réponse de victoire est envoyé au client :
* `type`: `victory`
* `room_id` : `int` réfère a l'ID de la salle.
* `mode` : `string` définissant le type de fin de match :
  * `points` : un joueur à atteinds le score objectif. `player` pointera vers ce dernier.
  * `timer` : le timer est écoulé, et le joueur au plus haut score est déclaré vainqueur. `player` pointera vers ce dernier.
  * `equal` : le timer est écoulé, et les deux joueurs sont à égalité. `player` vaudra 0. 
  * `abandon` : le joueur désigné par `player` a quitté le match avant qu'il ne commence.
  * `ragequit` : le joueur désigné par `player` a quitté le match en plein milieu. 
* `player` : ID du joueur désigné. 

### Tick
A chaque tick, la réponse suivante est envoyée : 
* `type`: `tick`
* `room_id` : `int` réfère a l'ID de la salle.
* `p1_pos`: `int` indiquant la position y du centre de la raquette du joueur à gauche.
* `p2_pos`: `int` indiquant la position y du centre de la raquette du joueur à droite.
* `p1_score`: `int` indiquant le nombre de points du joueur à gauche.
* `p2_score`: `int` indiquant le nombre de points du joueur à droite.
* `p1_boosting`: `boolean` indiquant si le joueur à gauche est en train d'utiliser son power-up.
* `p2_boosting`: `boolean` indiquant si le joueur à droite est en train d'utiliser son power-up.
* `p1_juice`: `int` indiquant en % la quantité d'énergie du power-up du joueur à gauche.
* `p2_juice`: `int` indiquant en % la quantité d'énergie du power-up du joueur à droite.
* `ball_x`: `int` indiquant la position x de la balle.
* `ball_y`: `int` indiquant la position y de la balle. 
* `ball_speed`: `float` indiquant la vitesse actuelle de la balle.
* `timer`: `int` indiquant en secondes le temps de jeu.

### Boing
Lorsque la balle rebondit, la réponse suivante est envoyée :
* `type` :
  * `bounce_player` : la balle rebondit sur un paddle.
  * `bounce_obstacle` : la balle rebondit sur un obstacle quelconque.
* `room_id` : `int` réfère a l'ID de la salle.
* `ball_x`: `int` indiquant la position x de la balle.
* `ball_y`: `int` indiquant la position y de la balle. 
* `ball_speed`: `float` indiquant la vitesse actuelle de la balle.

### Points
Lorsque la balle atteint la zone de but et qu'elle ne rebondit pas sur une raquette, un point est marqué et la réponse suivante est envoyée :
* `type`: `point`
* `room_id` : `int` réfère a l'ID de la salle.
* `player` : ID du joueur ayant marqué un point.

### Connection perdue
Lorsque la connection à la websocket de l'un des joueur est perdu, la réponse suivante est envoyée :
* `type`: `connection_lost`
* `room_id` : `int` réfère a l'ID de la salle.
* `player` : ID du joueur dont la connection a été perdu.

Si la connection a un spectateur est perdue, il est simplement retiré de la liste des spectateurs. 

### Inputs
La requête suivante est à envoyer lors de l'action d'un joueur :
* `type`: `input`
* `id`
* `room_id` : `int` réfère a l'ID de la salle.
* `move`: `string` référant au type de mouvement :
  * `down` : mouvement bas.
  * `up` : mouvement haut.
  * `boost`: active le power-up. Ce movement n'as pas de méthode.
* `method` : la méthode derrière le mouvement. 
  * `held` : le bouton est resté appuyé. Tant que la commande de relâche n'est pas envoyé, le joueur se déplacera en boucle.
  * `release` : le bouton n'est plus appuyé, et le joueur arrête de se déplacer.
  * `none` : un simple appui, et le joueur se déplace d'une unité. Valeur par défaut.

### Utilitaires
Voici quelques requêtes utiles :
* `type`: `list_all`

Occasionne une réponse du serveur, contenant les détails des matchs en cours. La réponse est une liste de réponse, composée des éléments suivants :
* `room_id` : `int` réfère a l'ID de la salle.
* `id_p1` : réfère au joueur à gauche du tableau.
* `id_p2` : réfère au joueur à droite du tableau.

La requête
* `type`: `find_one`
* `id`

Recherche dans la queue et les matchs le joueur désigné par l'ID. La réponse sera la suivante :
* `type`: `search_request`
* `result`: `string` détaillant le résultat de la recherche.
  * `found_in_match` : le joueur recherché est dans un match. Un champ additionnel `room_id` pointera vers l'ID du match.
  * `found_in_queue` : le joueur recherché est dans la file d'attente. 
  * `not_found` : le joueur recherché est introuvable.

La requête
* `type`: `dump_it_all_baby`

occasionne une réponse inutile contenant un tas d'info bidons du serveur :
* `port` : `int` désignant le port ouvert pour le serveur.
* `tick_rate`: `float` désignant le temps d'attente entre deux ticks.
* `execution_time`: `float` désignant le temps en seconde depuis le départ du serveur.
* `in_queue`: `int` désignant le nombre de joueurs dans la file d'attente.
* `matches` : `int` désignant le nombre de matchs en cours.
* `author` : Retourne mon ID a moi :)