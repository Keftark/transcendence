import { getUserByName } from "./apiFunctions.js";
import { setBallPosition } from "./ball.js";
import { receiveMessage } from "./chat.js";
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
export let matchAlreadyStarted = false;
let room_id = 0;

export function connectToServerInput()
{
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

export function connectToDuel()
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

export function readyToDuel()
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

export function notReadyToDuel()
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

export function exitLobby()
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

export function exitDuel()
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

export function sendPlayerReady()
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

export function playerUp()
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

export function playerUpNot()
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

export function playerDown()
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

export function playerDownNot()
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
            exitDuel();
        break;
    }
}

export function boostPaddle()
{
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

export function joinChat()
{
    console.log("Joining the chat");
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

export function quitChat()
{
    console.log("Quitting the chat");
    const event = {
        key: keySocket,
        type: "quit_chat",
        id: playerStats.id,
        answer: "no",
        server: "chat"
    };
    listener.send(JSON.stringify(event));
}

export function sendMessage(messageContent)
{
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

export function sendPrivMessage(targetMsg, messageContent) {
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

export function sendPrivSticker(targetMsg, stickerName) {
    getUserByName(targetMsg)
        .then((target) => {
            const event = {
                key: keySocket,
                type: "private_sticker",
                name: playerStats.nickname,
                target: target.id,
                id: playerStats.id,
                content: stickerName,
                answer: "no",
                server: "chat"
            };

            listener.send(JSON.stringify(event));
        })
        .catch((error) => {
            console.error("Failed to get user by name:", error);
        });
}

export function sendFriendRequest(friendId)
{
    const event = { // c'est pas fait !
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

export function askListMatchs()
{
    const event = {
        key: keySocket,
        type: "list_all",
        answer: "no",
        server: "1v1_classic"
    };
    listener.send(JSON.stringify(event));    
}

export function spectateMatch(id)
{
    const event = {
        key: keySocket,
        room_id: id,
        type: "spectate",
        answer: "no",
        server: "1v1_classic"
    };
    listener.send(JSON.stringify(event));    
}

export function unspectateMatch()
{
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
        console.log(data);
        // if (data === "Message received!")
        //     return;
        let event;
        try {
            event = JSON.parse(data);
        } catch (error) {
            console.log(data);
            console.error("Failed to parse JSON:", error);
            return;
        }
        if (keySocket == null && 'id' in event && 'key' in event && event.id === playerStats.id)
        {
            keySocket = event.key;
        }
        // console.log(event);
        switch (event.type) {

        case "private_message":
            if (event.id === playerStats.id)
                receiveMessage(event.sender_name, event.content, true, event.name);
            // console.log("Message received from " + event.name + ": " + event.content);
            break;
        case "private_sticker":
            if (event.id === playerStats.id)
                receiveMessage(event.sender_name, event.content, true, event.name);
            // console.log("Message received from " + event.name + ": " + event.content);
            break;
        case "message":
            receiveMessage(event.name, event.content);
            // console.log("Message received from " + event.name + ": " + event.content);
            break;
        case "wait":
            console.log("Waiting in queue");
            break;
        case "exit_queue":
            playerStats.room_id = -1;
            // le joueur quitte la file d'attente du match ( l'ecran de duel)
            // il faut verifier s'il y a un autre joueur de connecte 
            // (2 joueurs connectes = une room creee, on est plus dans la queue)
            console.log("Exit queue");
            break;
        case "wait_start":
            // console.log(event.p1_state + ", " + event.p2_state);
            updateReadyButtons(event.p1_state, event.p2_state);
            // document.getElementById("waitA").innerHTML = "Awaiting start : <br/>P1 :" + event.p1 + "</br>P2 :" + event.p2;
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
            console.log("Found a match against player " + event.id_p2);
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
            console.log(data);
            setPlayersControllers();
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