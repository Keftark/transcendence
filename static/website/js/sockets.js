import { setBallPosition } from "./ball.js";
import { closeDuelPanel, matchFound, setPlayersControllers, updateReadyButtons } from "./duelPanel.js";
import { addReadyPlayer, getBallPosition, getPlayerSideById, removeReadyPlayers, resetScreenFunction, spawnSparksFunction } from "./levelLocal.js";
import { getLevelState, socket, listener } from "./main.js";
import { clickPlayGame } from "./modesSelection.js";
import { playerStats } from "./playerManager.js";
import { setPlayersPositions } from "./playerMovement.js";
import { checkPowerUpState, setPowerBarsPlayers } from "./powerUp.js";
import { endOfMatch } from "./scoreManager.js";
import { LevelMode, VictoryType } from "./variables.js";
import { callVictoryScreen } from "./victory.js";

let room_id = 0;

export function connectToDuel()
{
    const event = {
        type: "join",
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
        type: "ready",
        room: room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function notReadyToDuel()
{
    const event = {
        type: "pause",
        room: room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function exitLobby()
{
    const event = {
        type: "quit_lobby",
        room: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function exitDuel()
{
    const event = {
        type: "quit_lobby",
        room: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));    
}

export function sendPlayerReady()
{
    const event = {
        type: "ready",
        room: playerStats.room_id,
        id: playerStats.id
    };
    socket.send(JSON.stringify(event));
}

export function playerUp()
{
    const event = {
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
        type: "input",
        room: room_id,
        id: playerStats.id,
        move: "boost",
        method: "osef"
    };
    socket.send(JSON.stringify(event));
}

export function addSocketListener()
{
    listener.addEventListener("message", ({ data }) => {
        // console.log(data);
        if (data === "Message received!")
            return;
        let event;
        try {
            event = JSON.parse(data); // Attempt to parse JSON
        } catch (error) {
            console.log(data);
            console.error("Failed to parse JSON:", error);
            return; // Exit if there's a syntax error
        }
        // console.log(event);
        switch (event.type) {
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
        case "match_start":
            setPlayersControllers();
            break;
        case "victory": // end of match, dans le lobby ou dans le match
            if (event.room_id != playerStats.room_id)
                return;
            console.log(data);
            if (event.mode === "abandon" && event.player != playerStats.id)
            {
                closeDuelPanel();
            }
            else if (event.mode === "ragequit" && event.player != playerStats.id)
            {
                endOfMatch();// mettre un argument pour forcer la victoire et indiquer que l'autre a quitte
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
            // x = parseInt(event.ball_x);
            // y = parseInt(event.ball_y);
            // console.log("room: " + event.room_id + ", player room: " + playerStats.room_id);
            if (event.room_id === playerStats.room_id);
            {
                setPlayersPositions(event.p1_pos, event.p2_pos);
                setBallPosition(event.ball_x, event.ball_y);
                setPowerBarsPlayers(event.p1_juice, event.p2_juice);
                checkPowerUpState(event.p1_boosting, event.p2_boosting, event.ball_boosting);
            }
            // y1 = event.p1_pos;
            // y2 = event.p2_pos;
            break;
        case "ping":
            break;
        default:
            throw new Error(`Unsupported event type: ${event.type}.`);
        }
    });    
}
