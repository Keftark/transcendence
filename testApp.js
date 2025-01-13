let i1 = 0;
let i2 = 0;
let room_id = 0;
let x = 0;
let y = 0;
let y1 = 0;
let y2 = 0;
let a = false;
let b = false;
let p1_boost = false;
let p2_boost = false;
let vroom = false;

window.addEventListener("DOMContentLoaded", () => {
    // Initialize the UI.
    const websocketA = new WebSocket("ws://localhost:7777/");
    const websocketB = new WebSocket("ws://localhost:8001/");
    receiveP1(websocketA);
    receiveP2(websocketB);
    draw_board();
    document.getElementById("boxA").innerHTML += "Websocket Initialized<br/>"
    document.getElementById("boxB").innerHTML += "Websocket Initialized<br/>"
    document.getElementById("chat").addEventListener("click", () => {
      const event = {
        server: "chat",
        type: "message",
        id: 5,
        name: "bite",
        content: "coucou",
        answer: "no"
      };
      websocketA.send(JSON.stringify(event));
    });
    document.getElementById("connA").addEventListener("click", () => {
        const event = {
            type: "join",
            server: "1v1_classic",
            answer: "no",
            id: 5,
            blacklist: {},
            private: "none",
            invited_by: 8,
            payload: { //Regles de configuration du match, TOUS doivent etre integres !
              id_p1: 8,
              id_p2: 5, //id du joueur a inviter
              point: 5,
              board_x: 40,
              board_y: 25,
              ball_radius: 0.8,
              ball_speed: 0.5,
              ball_increment: 0.05
            }
        };
        websocketA.send(JSON.stringify(event));
    });
    document.getElementById("quitA").addEventListener("click", () => {
      const event = {
          type: "quit",
          server: "1v1_classic",
          answer: "no",
          id: 5
      };
      websocketA.send(JSON.stringify(event));
    });
    document.getElementById("readA").addEventListener("click", () => {
      const event = {
          type: "ready",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 5
      };
      websocketA.send(JSON.stringify(event));
    });
    document.getElementById("pauseA").addEventListener("click", () => {
      const event = {
        type: "pause",
        server: "1v1_classic",
        answer: "no",
        room: room_id,
        id: 8
      };
      websocketB.send(JSON.stringify(event));
    });
    document.getElementById("downA").addEventListener("click", () => {
      const event = {
          type: "input",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 5,
          move: "down",
          method: "held"
      };
      websocketA.send(JSON.stringify(event));
    });
    document.getElementById("upA").addEventListener("click", () => {
      const event = {
          type: "input",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 5,
          move: "up",
          method: "held"
      };
      websocketA.send(JSON.stringify(event));
    });
    document.getElementById("neutA").addEventListener("click", () => {
      const event = {
          type: "input",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 5,
          move: "up",
          method: "release"
      };
      websocketA.send(JSON.stringify(event));
    });
    document.getElementById("boostA").addEventListener("click", () => {
      const event = {
          type: "input",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 5,
          move: "boost",
          method: "osef"
      };
      websocketA.send(JSON.stringify(event));
    });
    document.getElementById("connB").addEventListener("click", () => {
      const event = {
          type: "join",
          server: "1v1_classic",
          answer: "no",
          id: 8,
          blacklist: {},
          private: "none",
          invited_by: 8,
          payload: { //Regles de configuration du match, TOUS doivent etre integres !
            id_p1: 8,
            id_p2: 5,
            point: 5,
            board_x: 40,
            board_y: 25,
            ball_radius: 0.8,
            ball_speed: 0.5,
            ball_increment: 0.05,
            max_time: 300
          }
      };
      websocketB.send(JSON.stringify(event));
    });
    document.getElementById("quitB").addEventListener("click", () => {
      const event = {
        type: "quit",
        server: "1v1_classic",
        answer: "no",
        id: 8
      };
      websocketB.send(JSON.stringify(event));
    });
    document.getElementById("readB").addEventListener("click", () => {
      const event = {
        type: "ready",
        server: "1v1_classic",
        answer: "no",
        room: room_id,
        id: 8
      };
      websocketB.send(JSON.stringify(event));
    });
    document.getElementById("pauseB").addEventListener("click", () => {
      const event = {
        type: "pause",
        server: "1v1_classic",
        answer: "no",
        room: room_id,
        id: 8
      };
      websocketB.send(JSON.stringify(event));
    });
    document.getElementById("downB").addEventListener("click", () => {
      const event = {
          type: "input",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 8,
          move: "down",
          method: "held"
      };
      websocketB.send(JSON.stringify(event));
    });
    document.getElementById("upB").addEventListener("click", () => {
      const event = {
          type: "input",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 8,
          move: "up",
          method: "held"
      };
      websocketB.send(JSON.stringify(event));
    });
    document.getElementById("neutB").addEventListener("click", () => {
      const event = {
          type: "input",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 8,
          move: "up",
          method: "release"
      };
      websocketA.send(JSON.stringify(event));
    });
    document.getElementById("boostB").addEventListener("click", () => {
      const event = {
          type: "input",
          server: "1v1_classic",
          answer: "no",
          room: room_id,
          id: 8,
          move: "boost",
          method: "osef"
      };
      websocketA.send(JSON.stringify(event));
    });
  });

function draw_board()
{
  let truc = "";
  for (let i = 0; i < 51; i++) {
    for (let j = 0; j < 81; j++) {
      if (x + 40 == j && y + 25 == i)
        if (vroom == false)
          truc += "o"
        else
          truc += "⏺"
      else if (j == 0 && i < y1 + 6 && i > y1 - 6)
        if (p1_boost == true)
          truc += "<b>■</b>"
        else
          truc += "<b>□</b>"
      else if (j == 80 && i < y2 + 6 && i > y2 - 6)
        if (p2_boost == true)
          truc += "<b>■</b>"
        else
          truc += "<b>□</b>"
      else truc += "_"
    }
    truc += "</br>"
  }
  document.getElementById("boxC").innerHTML = truc;
}

function receiveP1(websocket) {
    websocket.addEventListener("message", ({ data }) => {
      const event = JSON.parse(data);
      switch (event.type) {
        case "wait":
            i1 += 1
            if (i1 > 20)
              i1 = 0
            if (i1 < 5)
              document.getElementById("waitA").innerHTML = "Waiting in queue";
            else if (i1 < 10)
              document.getElementById("waitA").innerHTML = "Waiting in queue .";
            else if (i1 < 15)
              document.getElementById("waitA").innerHTML = "Waiting in queue ..";
            else
              document.getElementById("waitA").innerHTML = "Waiting in queue ...";
            break;
        case "exit_queue":
            document.getElementById("waitA").innerHTML = "No waiting in here"
          break;
          case "wait_ready":
            document.getElementById("waitA").innerHTML = "Awaiting relaunch : <br/>P1 :" + event.p1_state + "</br>P2 :" + event.p2_state;
            break;
          case "wait_start":
              document.getElementById("waitA").innerHTML = "Awaiting start : <br/>P1 :" + event.p1_state + "</br>P2 :" + event.p2_state;
              break;
        case "match_init":
          room_id = event.room_id;
          if (a == false)
          {
            document.getElementById("boxA").innerHTML += "Found a match against player " + event.id_p2 + "<br/>";
            a = true
          }
          break;
        case "match_start":
            document.getElementById("boxA").innerHTML += "LET'S FUCKING GO<br/>";
            break;
        case "error":
          console.log("Got error : " + event.content);
          break;
          case "point":
            if (event.player == 5)
            {
              document.getElementById("boxA").innerHTML += "GG pour le point<br/>";
              document.getElementById("boxB").innerHTML += "T'es nul lol<br/>";
            }
            if (event.player == 8)
            {
              document.getElementById("boxB").innerHTML += "GG pour le point<br/>";
              document.getElementById("boxA").innerHTML += "T'es nul lol<br/>";
            }
            break;
            case "victory":
              if (event.player == 5)
              {
                document.getElementById("boxA").innerHTML += "T'as gagné :)<br/>";
                document.getElementById("boxB").innerHTML += "T'as perdu :(<br/>";
              }
              if (event.player == 8)
              {
                document.getElementById("boxB").innerHTML += "T'as gagné :)<br/>";
                document.getElementById("boxA").innerHTML += "T'as perdu :(<br/>";
              }
              break;
          case "tick":
            x = parseInt(event.ball_x)
            y = parseInt(event.ball_y)
            y1 = event.p1_pos + 25
            y2 = event.p2_pos + 25
            p1_boost = event.p1_boosting
            p2_boost = event.p2_boosting
            vroom = event.ball_boosting
            //console.log("Ball pos : " + x + ";" + y + "")
            document.getElementById("tick").innerHTML = parseInt(event.timer)
            document.getElementById("powA").innerHTML = parseInt(event.p1_juice)
            document.getElementById("powB").innerHTML = parseInt(event.p2_juice)
            document.getElementById("pointA").innerHTML = parseInt(event.p1_score)
            document.getElementById("pointB").innerHTML = parseInt(event.p2_score)
            draw_board()
            break;
        case "ping":
            break;
        default:
          throw new Error(`Unsupported event type: ${event.type}.`);
      }
    });
}

function receiveP2(websocket) {
    websocket.addEventListener("message", ({ data }) => {
      const event = JSON.parse(data);
      console.log(data)
      switch (event.type) {
        case "wait":
            i2 += 1
            if (i2 > 20)
              i2 = 0
            if (i2 < 5)
              document.getElementById("waitB").innerHTML = "Waiting in queue";
            else if (i2 < 10)
              document.getElementById("waitB").innerHTML = "Waiting in queue .";
            else if (i2 < 15)
              document.getElementById("waitB").innerHTML = "Waiting in queue ..";
            else
              document.getElementById("waitB").innerHTML = "Waiting in queue ...";
            break;
        case "exit_queue":
            document.getElementById("waitB").innerHTML = "No waiting in here"
          break;
        case "wait_ready":
          document.getElementById("waitB").innerHTML = "Awaiting relaunch : <br/>P1 :" + event.p1_state + "</br>P2 :" + event.p2_state;
          break;
        case "wait_start":
            document.getElementById("waitB").innerHTML = "Awaiting start : <br/>P1 :" + event.p1_state + "</br>P2 :" + event.p2_state;
            break;
        case "match_init":
          room_id = event.room_id;
          draw_board();
          document.getElementById("boxB").innerHTML += "Found a match against player " + event.id_p1 + "<br/>";
          break;
        case "match_start":
            document.getElementById("boxB").innerHTML += "LET'S FUCKING GO<br/>";
            break;
        case "error":
          console.log("Got error : " + event.content);
          break;
        case "point":
          if (event.player == 5)
          {
            document.getElementById("boxA").innerHTML += "GG pour le point<br/>";
            document.getElementById("boxB").innerHTML += "T'es nul lol<br/>";
          }
          if (event.player == 8)
          {
            document.getElementById("boxB").innerHTML += "GG pour le point<br/>";
            document.getElementById("boxA").innerHTML += "T'es nul lol<br/>";
          }
          break;
          case "victory":
            if (event.player == 5)
            {
              document.getElementById("boxA").innerHTML += "T'as gagné :)<br/>";
              document.getElementById("boxB").innerHTML += "T'as perdu :(<br/>";
            }
            if (event.player == 8)
            {
              document.getElementById("boxB").innerHTML += "T'as gagné :)<br/>";
              document.getElementById("boxA").innerHTML += "T'as perdu :(<br/>";
            }
            break;
        case "tick":
          x = parseInt(event.ball_x)
          y = parseInt(event.ball_y)
          y1 = event.p1_pos + 25
          y2 = event.p2_pos + 25
          p1_boost = event.p1_boosting
          p2_boost = event.p2_boosting
          vroom = event.ball_boosting
          //console.log("Ball pos : " + x + ";" + y + "")
          document.getElementById("tick").innerHTML = parseInt(event.timer)
          document.getElementById("powA").innerHTML = parseInt(event.p1_juice)
          document.getElementById("powB").innerHTML = parseInt(event.p2_juice)
          document.getElementById("pointA").innerHTML = parseInt(event.p1_score)
          document.getElementById("pointB").innerHTML = parseInt(event.p2_score)
          draw_board()
          break;
        case "ping":
          break;
        default:
          throw new Error(`Unsupported event type: ${event.type}.`);
      }
    });
}