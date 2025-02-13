import { getBlockedList, getUserById, getUserByName } from "./apiFunctions.js";
import { setBallPosition } from "./ball.js";
import { createInvitationDuel, deleteDuelInChat, receiveGameSticker, receiveMessage } from "./chat.js";
import { closeDuelPanel, matchFound, setPlayersControllers, updateReadyButtons } from "./duelPanel.js";
import { addReadyPlayer, doUpdateBallLight, endMatch, getBallPosition, getPlayerSideById, removeReadyPlayers, resetScreenFunction, spawnSparksFunction, startScreenShake } from "./levelLocal.js";
import { getLevelState, socket, listener } from "./main.js";
import { getListMatchs, setSelectedMode } from "./modesSelection.js";
import { closeMultiPanel, isPlayerSameSide, matchFoundMulti, setPlayersControllersMulti, updateReadyButtonsMulti } from "./multiPanel.js";
import { getCurrentView, navigateTo } from "./pages.js";
import { playerStats } from "./playerManager.js";
import { setPlayersPositions } from "./playerMovement.js";
import { checkPowerUpState, resetBoostBar, setPowerBarsPlayers } from "./powerUp.js";
import { setArenaType } from "./rules.js";
import { endOfMatch, getScoreP1, getScoreP2 } from "./scoreManager.js";
import { setTimeFromServer } from "./timer.js";
import { LevelMode, VictoryType } from "./variables.js";
import { callVictoryScreen } from "./victory.js";

export let keySocket = null;
let matchAlreadyStarted = false;
let id_room = 0;

export function setMatchAlreadyStarted(isTrue)
{
    matchAlreadyStarted = isTrue;
}

export function getMatchAlreadyStarted()
{
    return matchAlreadyStarted;
}

export function connectToServerInput()
{
    if (!socket || socket.readyState !== WebSocket.OPEN)
        return;
    const event = {
        server: "main",
        type: "log",
        id: playerStats.id,
        name: playerStats.nickname, // mettre les id au lieu des noms
        socket: "input",
        answer: "no"
    };
    socket.send(JSON.stringify(event));   
}

export function connectToServerOutput()
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    const event = {
        server: "main",
        type: "log",
        id: playerStats.id,
        name: playerStats.nickname, // mettre les id au lieu des noms
        socket: "output",
        answer: "no"
    };
    listener.send(JSON.stringify(event));   
}

export function socketConnectToDuel(mode = "1v1_classic")
{
    getBlockedList(true)
    .then((results) => {
        // console.log("Array: " + results);
        const event = {
            key: keySocket,
            server: mode,
            type: "join",
            answer: "no",
            id: playerStats.id,
            // blacklist: results,
            blacklist: {},
            private: "none",
            invited_by: 8,
            payload: {}
        };
        listener.send(JSON.stringify(event));
    })
    .catch((error) => {
        console.error("Failed to get user by name:", error);
    });
}

export function socketConnectToDuelInvited(playerId)
{
    getBlockedList(true)
    .then((results) => {
        const event = {
            key: keySocket,
            server: "1v1_classic",
            type: "join",
            answer: "no",
            id: playerStats.id,
            // blacklist: results,
            blacklist: {},
            private: "join",
            invited_by: playerId,
            payload: {}
        };
        listener.send(JSON.stringify(event));
    })
    .catch((error) => {
        console.error("Failed to get user by name:", error);
    });
}

export function socketRefuseDuelInvited(playerId)
{
    const event = {
        key: keySocket,
        server: "1v1_classic",
        type: "join",
        answer: "no",
        id: playerStats.id,
        blacklist: playerStats.blacklist, // mettre les id au lieu des noms
        private: "refuse",
        invited_by: playerId,
        payload: {}
    };
    listener.send(JSON.stringify(event));
}

export function socketReadyToDuel(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "ready",
        room_id: id_room,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function socketNotReadyToDuel(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "pause",
        room_id: id_room,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function socketExitLobby(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "quit_lobby",
        room_id: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function socketExitDuel(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "quit_lobby",
        room_id: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));    
}

export function socketSendPlayerReady(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "ready",
        room_id: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function socketPlayerUp(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "input",
        room_id: playerStats.room_id,
        id: playerStats.id,
        move: "up",
        method: "held"
    };
    socket.send(JSON.stringify(event));
}

export function socketPlayerUpNot(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "input",
        room_id: playerStats.room_id,
        id: playerStats.id,
        move: "up",
        method: "release"
    };
    socket.send(JSON.stringify(event));
}

export function socketPlayerDown(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "input",
        room_id: playerStats.room_id,
        id: playerStats.id,
        move: "down",
        method: "held"
    };
    socket.send(JSON.stringify(event));
}

export function socketPlayerDownNot(mode = "1v1_classic")
{
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "input",
        room_id: playerStats.room_id,
        id: playerStats.id,
        move: "down",
        method: "release"
    };
    socket.send(JSON.stringify(event));
}

export function exitGameSocket()
{
    const currentMode = getLevelState();
    switch (currentMode)
    {
        case LevelMode.ONLINE:
            socketExitDuel();
        break;
    }
}

export function socketBoostPaddle(mode = "1v1_classic")
{
    if (!socket || socket.readyState !== WebSocket.OPEN)
        return;
    const event = {
        key: keySocket,
        answer: "no",
        server: mode,
        type: "input",
        room_id: id_room,
        id: playerStats.id,
        move: "boost",
        method: "osef"
    };
    // console.log("Sending boost: " + JSON.stringify(event));
    socket.send(JSON.stringify(event));
}

export function socketSendMessage(messageContent)
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    const event = {
        key: keySocket,
        type: "message",
        name: playerStats.nickname,
        id: playerStats.id,
        content: messageContent,
        answer: "no",
        server: "chat"
    };
    listener.send(JSON.stringify(event));
}

export function socketCreateDuelInvit(targetMsg) {
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    if (targetMsg != "")
    {
        getUserByName(targetMsg)
            .then((target) => {
                const event = {
                    key: keySocket,
                    server: "1v1_classic",
                    type: "join",
                    answer: "no",
                    id: playerStats.id,
                    blacklist: playerStats.blacklist,
                    private: "invite",
                    invited: target.id,
                    invited_by: playerStats.id,
                    payload: {}
                };
                listener.send(JSON.stringify(event));
            })
            .catch((error) => {
                console.error("Failed to get user by name:", error);
            });
    }
}

export function socketSendPrivMessage(targetMsg, messageContent) {
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    getUserByName(targetMsg)
        .then((target) => {
            const event = {
                key: keySocket,
                type: "private_message",
                name: playerStats.nickname,
                target: target.id,
                id: playerStats.id,
                content: messageContent,
                answer: "no",
                server: "chat"
            };

            listener.send(JSON.stringify(event));
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
        });
}

export function socketSendPrivSticker(targetMsg, stickerName) {
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    getUserByName(targetMsg)
        .then((target) => {
            const event = {
                key: keySocket,
                type: "private_sticker",
                name: playerStats.nickname,
                target: target.id,
                id: playerStats.id,
                img: stickerName,
                answer: "no",
                server: "chat"
            };

            listener.send(JSON.stringify(event));
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
        });
}

export function socketSendPublicSticker(stickerName)
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    const event = {
        key: keySocket,
        type: "sticker",
        name: playerStats.nickname,
        id: playerStats.id,
        img: stickerName,
        answer: "no",
        server: "chat"
    };
    listener.send(JSON.stringify(event));
}

export function socketSendSalonSticker(stickerName)
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    // console.log("Sending salon sticker");
    const event = {
        key: keySocket,
        type: "salon_sticker",
        name: playerStats.nickname,
        id: playerStats.id,
        img: stickerName,
        room_id: id_room,
        answer: "no",
        server: "chat"
    };
    listener.send(JSON.stringify(event));
}


// export function socketSendFriendRequest(friendId)
// {
//     if (!listener || listener.readyState !== WebSocket.OPEN)
//         return;
//     const event = { // c'est pas fait !
//         key: keySocket,
//         type: "message",
//         name: playerStats.nickname,
//         id: playerStats.id,
//         content: messageContent,
//         answer: "no",
//         server: "chat"
//     };
//     listener.send(JSON.stringify(event));
// }

export function socketAskListMatchs()
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    const event = {
        key: keySocket,
        id: playerStats.id,
        type: "list_all",
        answer: "no",
        server: "1v1_classic"
    };
    listener.send(JSON.stringify(event));    
}

export function socketSpectateMatch(id)
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    const event = {
        key: keySocket,
        room_id: id,
        type: "spectate",
        id: playerStats.id,
        answer: "no",
        server: "1v1_classic"
    };
    listener.send(JSON.stringify(event));    
}

export function socketUnspectateMatch()
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    const event = {
        key: keySocket,
        type: "unspectate",
        answer: "no",
        server: "1v1_classic"
    };
    listener.send(JSON.stringify(event));    
}

/**
Fonction a utiliser pour envoyer une demande d'ami
*/
export function socketSendFriendInvite(targetMsg) {
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    getUserByName(targetMsg)
        .then((target) => {
            const event = {
                key: keySocket,
                type: "friend",
                name: playerStats.nickname,
                target: target.id,
                id: playerStats.id,
                method: "invite",
                answer: "no",
                server: "chat"
            };

            listener.send(JSON.stringify(event));
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
        });
}

/**
Fonction a utiliser pour annuler une demande d'ami
*/
export function socketSendFriendInvite(targetMsg) {
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    getUserByName(targetMsg)
        .then((target) => {
            const event = {
                key: keySocket,
                type: "friend",
                name: playerStats.nickname,
                target: target.id,
                id: playerStats.id,
                method: "cancel",
                answer: "no",
                server: "chat"
            };

            listener.send(JSON.stringify(event));
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
        });
}

/**
Fonction a utiliser pour accepter une demande d'ami.
La target devient donc la personne qui a envoyé la 
demande !
*/
export function socketSendFriendAccept(targetMsg) {
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    getUserByName(targetMsg)
        .then((target) => {
            const event = {
                key: keySocket,
                type: "friend",
                name: playerStats.nickname,
                target: target.id,
                id: playerStats.id,
                method: "accept",
                answer: "no",
                server: "chat"
            };

            listener.send(JSON.stringify(event));
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
        });
}

/**
Fonction a utiliser pour refuser une demande d'ami.
La target devient donc la personne qui a envoyé la 
demande !
*/
export function socketSendFriendRefuse(targetMsg) {
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    getUserByName(targetMsg)
        .then((target) => {
            const event = {
                key: keySocket,
                type: "friend",
                name: playerStats.nickname,
                target: target.id,
                id: playerStats.id,
                method: "refuse",
                answer: "no",
                server: "chat"
            };

            listener.send(JSON.stringify(event));
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
        });
}


let isInDuel = false;
export function addSocketListener()
{
    listener.addEventListener("message", ({ data }) => {
        // console.log(data);
        let event;
        try {
            event = JSON.parse(data);
        } catch (error) {
            // console.log(data);
            console.error("Failed to parse JSON:", error);
            return;
        }
        if ('id' in event && 'type' in event && event.id === playerStats.id)
        {
            return;
        }
        if ('id' in event && 'key' in event && event.id === playerStats.id)
        {
            keySocket = event.key;
            return;
        }
        switch (event.type) {

            case "friend": //Gestion d'amis
                switch (event.method) {
                    case ("demand"):
                        //Quelqu'un t'as demandé en ami
                        break;
                    case ("accept"):
                        //Ta demande d'ami a abouti !
                        break;
                    case ("refuse"):
                        //Coup dur
                        break;
                    case ("cancel"):
                        //Annulation de la demande d'ami
                        break;
                }
                break;
            case "private_message":
                if (event.id === playerStats.id)
                    receiveMessage(event.sender_name, event.content, false, true, event.name);
                break;
            case "private_sticker":
                if (event.id === playerStats.id)
                {
                    receiveMessage(event.sender_name, event.img, true, true, event.name);
                }
                break;
            case "salon_sticker":
                if (event.room_id === playerStats.room_id)
                    receiveGameSticker(event.id, event.img);
                break;
            case "sticker":
                if (event.id != playerStats.id)
                {
                    // console.log("receiving salon sticker: " + event.img);
                    receiveMessage(event.name, event.img, true);
                }
                break;
            case "message":
                receiveMessage(event.name, event.content, false);
                break;
            case "wait":
                // console.log("Waiting in queue");
                break;
            case "exit_queue":
                playerStats.room_id = -1;
                // le joueur quitte la file d'attente du match ( l'ecran de duel)
                // il faut verifier s'il y a un autre joueur de connecte 
                // (2 joueurs connectes = une room creee, on est plus dans la queue)
                // console.log("Exit queue");
                break;
            case "wait_start":
                if (getCurrentView() === "duel")
                    updateReadyButtons(event.p1_state, event.p2_state);
                else
                    updateReadyButtonsMulti(event.p1_state, event.p2_state, event.p3_state, event.p4_state);
                break;
            case "wait_ready":
                // console.log(data);
                if (event.p1_state)
                    addReadyPlayer(1);
                if (event.p2_state)
                    addReadyPlayer(2);
                if (event.p3_state)
                    addReadyPlayer(3);
                if (event.p4_state)
                    addReadyPlayer(4);
                break;
            case "match_init":
                // console.log(data);
                id_room = event.room_id;
                playerStats.room_id = id_room;
                setArenaType(event.level_type);
                if (getCurrentView() === "duel")
                {
                    setTimeout(() => {
                        matchFound(event.id_p1, event.id_p2);
                    }, 1000);
                }
                else
                {
                    setTimeout(() => {
                        matchFoundMulti(event.id_p1, event.id_p2, event.id_p3, event.id_p4);
                    }, 1000);
                }
                break;
            case "match_resume":
                // console.log(data);
                removeReadyPlayers();
                break;
            case "list_all":
                getListMatchs(event.data);
                break;
            case "match_start":
                if (matchAlreadyStarted)
                    break;
                matchAlreadyStarted = true;
                // console.log(data);
                if (getCurrentView() === "duel")
                {
                    isInDuel = true;
                    setPlayersControllers();
                }
                else
                {
                    isInDuel = false;
                    setPlayersControllersMulti();
                }
                break;
            case "bounce_player":
                if (event.room_id != playerStats.room_id)
                    return;
                const strength = event.ball_boosted ? event.ball_speed * 150 : event.ball_speed * 75;
                startScreenShake(event.ball_speed / 6, strength);
                doUpdateBallLight();
                if (event.ball_speed > 0.78)
                    spawnSparksFunction(getBallPosition(), event.ball_speed * 20);
                break;
            case "victory": // end of match, dans le lobby ou dans le match
                // console.log("Victory: " + data);
                if (event.room_id != playerStats.room_id)
                    return;
                // console.log(data);
                if (event.mode === "abandon" && event.player != playerStats.id)
                {
                    if (getCurrentView() === "duel")
                        closeDuelPanel(true);
                    else
                        closeMultiPanel(true);
                }
                else if ((event.mode === "disconnected" || event.mode === "ragequit") && event.player != playerStats.id)
                {
                    if (!isPlayerSameSide(event.player))
                        callVictoryScreen(VictoryType.VICTORY);
                    // aficher un message different si le mode est disconnected ou ragequit?
                    // endOfMatch(true);// mettre un argument pour forcer la victoire et indiquer que l'autre a quitte
                }
                else if (event.mode === "points" || event.mode === "timer")
                {
                    endMatch(getScoreP1(), getScoreP2());
                    setTimeout(() => {
                        if (isPlayerSameSide(event.player))
                            callVictoryScreen(VictoryType.VICTORY);
                        else
                            callVictoryScreen(VictoryType.DEFEAT);
                    }, 1800);
                }
                else if (event.mode === "equal") // unused
                    callVictoryScreen(VictoryType.EXAEQUO);
                break;
            case "connection_lost": // plus utile ?
                // la meme chose que victory
                break;
            case "error":
                console.log("Got error : " + event.content);
                break;
            case "point":
                // console.log(data);
                if (event.room_id != playerStats.room_id)
                    return;
                resetBoostBar();
                spawnSparksFunction(getBallPosition(), 400);
                let nbr = getPlayerSideById(event.player);
                // console.log("Nbr before: " + nbr);
                if (isInDuel)
                {
                    if (nbr === 0)
                        nbr = 2;
                    else if (nbr === 1)
                        nbr = 1;
                }
                else // code pas normal !
                {
                    if (nbr === 2)
                        nbr = 1;
                    else if (nbr === 1)
                        nbr = 2;
                }
                // console.log("Nbr after: " + nbr);
                resetScreenFunction(nbr, true);
                break;
            case "tick":
                if (event.room_id != playerStats.room_id)
                    return;
                console.log(data);
                if (isInDuel)
                {
                    setPlayersPositions(
                        isNaN(event.p1_pos) ? 0 : event.p1_pos,
                        isNaN(event.p2_pos) ? 0 : event.p2_pos
                    );
                }
                else
                {
                    setPlayersPositions(
                        isNaN(event.p1_pos) ? 0 : event.p1_pos,
                        isNaN(event.p2_pos) ? 0 : event.p2_pos,
                        isNaN(event.p3_pos) ? 0 : event.p3_pos,
                        isNaN(event.p4_pos) ? 0 : event.p4_pos
                    );
                }
                setBallPosition(
                    isNaN(event.ball_x) ? 0 : event.ball_x,
                    isNaN(event.ball_y) ? 0 : event.ball_y);
                setPowerBarsPlayers(event.p1_juice, event.p2_juice, event.p3_juice, event.p4_juice);
                checkPowerUpState(event.p1_boosting, event.p2_boosting, event.ball_boosting);
                setTimeFromServer(event.timer);
                break;
            case "invite":
                getUserById(event.from)
                    .then(playerProfile => {
                        createInvitationDuel(playerProfile.username, playerProfile.id);
                    })
                    .catch(error => {
                        console.error("Error fetching user profile:", error);
                        reject(error); // Reject if an error occurs
                    });
                break;
            case "wait_start_invited":
                // console.log("got an invitation: " + data);
                break;
            case "crash":
                console.log(data);
                break;
            case "refusal":
                setSelectedMode(LevelMode.MENU);
                navigateTo('home');
                deleteDuelInChat();
                break;
            case "ping":
                break;
            default:
                console.log("Undefined event: " + data);
                // throw new Error(`Unsupported event type: ${event.type}.`);
        }
    });    
}

// export function chatSocketListener()
// {
//     listener.addEventListener("message", ({ data }) => {
//         // console.log(data);
//         let event;
//         try {
//             event = JSON.parse(data);
//         } catch (error) {
//             console.log(data);
//             console.error("Failed to parse JSON:", error);
//             return;
//         }
//         // console.log(event);
//         switch (event.type)
//         {
//             case "message":
//                 receiveMessage(event.name, event.content);
//                 // console.log("Message received from " + event.name + ": " + event.content);
//                 break;
//             default:
//                 throw new Error(`Unsupported event type: ${event.type}.`);
//         }
//     });
// }
