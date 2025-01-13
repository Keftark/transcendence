Le serveur central recoit les connexions des clients, et les distribues vers les sous-serveurs. 

### Connexion
Afin d'etre connecte au serveur central, il est necessaire d'envoyer les deux requetes suivantes : 
* `server` : `main`
* `type` : `log`
* `id` : `int` étant l'ID du joueur faisant la requête.
* `name` : `string` definissant un nom d'utilisateur.
* `socket` : `input` et `output`.

Les deux doivent etre envoye. Lorsque les deux seront envoye, la reponse suivante sera genere, contenant la clef d'identification de l'utilisateur :
* `id`
* `key`

### Transferer une requete
Pour transferer une requete vers un sous-serveur, il suffit d'ajouter ce champs dans la requete :
* `server`: `string` definissant le sous-serveur
  * `main` : Ne transfere pas la requete.
  * `chat` : transfere la requete au serveur de chat.
  * `1v1_classic` : transfere la requete au serveur de jeu 1v1 classique.

De plus, il faudra egalement ajouter le champ key a la requete :
* `key`

### Healthcheck
Envoyer la requete suivante 
* `server` : `main`
* `type` : `healthcheck`
* `answer` : `no`

occasionne une reponse qui affiche l'etat des sous-serveurs.
* `chat_server` : `boolean` qui vaut `true` si le serveur de chat est connecte, `false` sinon.
* `1v1_classic_server` : `boolean` qui vaut `true` si le serveur de jeu (1v1 classique) est connecte, `false` sinon.