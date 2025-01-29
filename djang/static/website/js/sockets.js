import { getUserByName } from "./apiFunctions.js";
import { setBallPosition } from "./ball.js";
import { receiveGameSticker, receiveMessage } from "./chat.js";
import { closeDuelPanel, matchFound, setPlayersControllers, updateReadyButtons } from "./duelPanel.js";
import { addReadyPlayer, doUpdateBallLight, getBallPosition, getPlayerSideById, removeReadyPlayers, resetScreenFunction, spawnSparksFunction, startScreenShake } from "./levelLocal.js";
import { getLevelState, socket, listener } from "./main.js";
import { getListMatchs } from "./modesSelection.js";
import { playerStats } from "./playerManager.js";
import { setPlayersPositions } from "./playerMovement.js";
import { checkPowerUpState, setPowerBarsPlayers } from "./powerUp.js";
import { endOfMatch } from "./scoreManager.js";
import { setTimeFromServer } from "./timer.js";
import { LevelMode, VictoryType } from "./variables.js";
import { callVictoryScreen } from "./victory.js";

export let keySocket = null;
let matchAlreadyStarted = false;
let room_id = 0;

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

export function socketConnectToDuel()
{
    const event = {
        key: keySocket,
        server: "1v1_classic",
        type: "join",
        answer: "no",
        id: playerStats.id,
        blacklist: {}, // mettre les id au lieu des noms
        private: "none", // 
        invited_by: 8, // utile seulement si private n'est pas none
        payload: { //Regles de configuration du match, TOUS doivent etre integres !
            id_p1: 8,
            id_p2: 5, //id du joueur a inviter
            point: 3,
            board_x: 40,
            board_y: 25,
            ball_radius: 0.8,
            ball_speed: 0.5,
            ball_increment: 0.05,
            max_time: 300
        }
    };
    listener.send(JSON.stringify(event));
}

export function socketReadyToDuel()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "ready",
        room: room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function socketNotReadyToDuel()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "pause",
        room: room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function socketExitLobby()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "quit_lobby",
        room: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function socketExitDuel()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "quit_lobby",
        room: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));    
}

export function socketSendPlayerReady()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "ready",
        room: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function socketPlayerUp()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "input",
        room: playerStats.room_id,
        id: playerStats.id,
        move: "up",
        method: "held"
    };
    socket.send(JSON.stringify(event));
}

export function socketPlayerUpNot()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "input",
        room: playerStats.room_id,
        id: playerStats.id,
        move: "up",
        method: "release"
    };
    socket.send(JSON.stringify(event));
}

export function socketPlayerDown()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "input",
        room: playerStats.room_id,
        id: playerStats.id,
        move: "down",
        method: "held"
    };
    socket.send(JSON.stringify(event));
}

export function socketPlayerDownNot()
{
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "input",
        room: playerStats.room_id,
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

export function socketBoostPaddle()
{
    if (!socket || socket.readyState !== WebSocket.OPEN)
        return;
    const event = {
        key: keySocket,
        answer: "no",
        server: "1v1_classic",
        type: "input",
        room: room_id,
        id: playerStats.id,
        move: "boost",
        method: "osef"
    };
    socket.send(JSON.stringify(event));
}

export function socketJoinChat()
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    // console.log("Joining the chat");
    const event = {
        key: keySocket,
        type: "join_chat",
        id: playerStats.id,
        name: playerStats.nickname,
        blacklist: playerStats.blacklist,
        answer: "no",
        server: "chat"
    };
    listener.send(JSON.stringify(event));
}

export function socketQuitChat()
{
    if (!listener || listener.readyState !== WebSocket.OPEN)
        return;
    // console.log("Quitting the chat");
    const event = {
        key: keySocket,
        type: "quit_chat",
        id: playerStats.id,
        answer: "no",
        server: "chat"
    };
    listener.send(JSON.stringify(event));
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
    const event = {
        key: keySocket,
        type: "salon_sticker",
        name: playerStats.nickname,
        id: playerStats.id,
        img: stickerName,
        room: room_id,
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
        if (keySocket == null && 'id' in event && 'key' in event && event.id === playerStats.id)
        {
            keySocket = event.key;
        }
        switch (event.type) {

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
            {
                receiveGameSticker(event.id, event.img);
            }
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
            updateReadyButtons(event.p1_state, event.p2_state);
            break;
        case "wait_ready":
            if (event.p1_state)
            {
                addReadyPlayer(1);
            }
            else if (event.p2_state)
            {
                addReadyPlayer(2);
            }
            break;
        case "match_init":
            room_id = event.room_id;
            playerStats.room_id = room_id;
            // console.log("Found a match against player " + event.id_p2);
            setTimeout(() => {
                matchFound(event.id_p1, event.id_p2);
            }, 1000);
            break;
        case "match_resume":
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
            setPlayersControllers();
            break;
        case "bounce_player":
            { if (event.room_id != playerStats.room_id)
                return;
            const strength = event.ball_boosted ? event.ball_speed * 150 : event.ball_speed * 75;
            startScreenShake(event.ball_speed / 6, strength);
            doUpdateBallLight();
            if (event.ball_speed > 0.78)
                spawnSparksFunction(getBallPosition(), event.ball_speed * 20);
            break; }
        case "victory": // end of match, dans le lobby ou dans le match
            if (event.room_id != playerStats.room_id)
                return;
            // console.log(data);
            if (event.mode === "abandon" && event.player != playerStats.id)
            {
                closeDuelPanel();
            }
            else if ((event.mode === "disconnected" || event.mode === "ragequit") && event.player != playerStats.id)
            {
                // aficher un message different si le mode est disconnected ou ragequit?
                endOfMatch(true);// mettre un argument pour forcer la victoire et indiquer que l'autre a quitte
            }
            else if (event.mode === "points" || event.mode === "timer")
            {
                if (event.player === playerStats.id)
                    callVictoryScreen(VictoryType.VICTORY);
                else
                    callVictoryScreen(VictoryType.DEFEAT);
            }
            else if (event.mode === "equal")
                callVictoryScreen(VictoryType.EXAEQUO);
            break;
        case "connection_lost": // plus utile ?
            // la meme chose que victory
            break;
        case "error":
            console.log("Got error : " + event.content);
            break;
        case "point":
            if (event.room_id === playerStats.room_id);
            {
                spawnSparksFunction(getBallPosition(), 400);
                let nbr = getPlayerSideById(event.player) + 1;
                // inversion du joueur ayant marque un but
                if (nbr === 1)
                    nbr = 2;
                else if (nbr === 2)
                    nbr = 1;
                resetScreenFunction(nbr, true);
            }
            break;
        case "tick":
            if (event.room_id === playerStats.room_id);
            {
                setPlayersPositions(event.p1_pos, event.p2_pos);
                setBallPosition(event.ball_x, event.ball_y);
                setPowerBarsPlayers(event.p1_juice, event.p2_juice);
                checkPowerUpState(event.p1_boosting, event.p2_boosting, event.ball_boosting);
                setTimeFromServer(event.timer);
            }
            break;
        case "ping":
            break;
        default:
            throw new Error(`Unsupported event type: ${event.type}.`);
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