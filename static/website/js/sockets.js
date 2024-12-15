import { matchFound, updateReadyButtons } from "./duelPanel.js";
import { socket } from "./main.js";
import { playerStats } from "./playerManager.js";

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
            ball_increment: 0.05
        },
    };
    socket.send(JSON.stringify(event));
}

export function readyToDuel()
{
    const event = {
        type: "ready",
        room: room_id,
        id: playerStats.id,
    };
    socket.send(JSON.stringify(event));
}

export function notReadyToDuel()
{
    const event = {
        type: "pause",
        room: room_id,
        id: playerStats.id,
    };
    socket.send(JSON.stringify(event));
}

export function exitDuel()
{
    const event = {
        type: "quit",
        id: playerStats.id,
    };
    socket.send(JSON.stringify(event));    
}

export async function addSocketListener()
{
    socket.addEventListener("message", ({ data }) => {
        // console.log(data);
        const event = JSON.parse(data);
        switch (event.type) {
        case "wait":
            console.log("Waiting in queue");
            break;
        case "exit_queue":
            // le joueur quitte la file d'attente du match ( l'ecran de duel)
            // il faut verifier s'il y a un autre joueur de connecte 
            // (2 joueurs connectes = une room creee, on est plus dans la queue)
            console.log("Exit queue");
            break;
        case "wait_ready":
            console.log(event.p1_state + ", " + event.p2_state);
            updateReadyButtons(event.p1_state, event.p2_state);
            // document.getElementById("waitA").innerHTML = "Awaiting start : <br/>P1 :" + event.p1 + "</br>P2 :" + event.p2;
            break;
        case "match_start":
            room_id = event.room_id;
            console.log("Found a match against player " + event.id_p2);
            setTimeout(() => {
                matchFound(event.id_p1, event.id_p2);
            }, 1000);
            break;
        case "error":
            console.log("Got error : " + event.content);
            break;
        case "tick":
            break;
        case "ping":
            break;
        default:
            throw new Error(`Unsupported event type: ${event.type}.`);
        }
    });    
}
