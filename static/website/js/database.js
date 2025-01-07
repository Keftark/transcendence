import { createPlayerStats } from "./playerManager.js";
import { MatchResult } from "./scoreManager.js";

export let fakeDatabase = [];
function createFakeDatabase()
{
    let player1 = createPlayerStats();
    player1.nickname = "Gamer123";
    player1.firstName = "John";
    player1.lastName = "Doe";
    player1.mail = "john.doe@example.com";
    player1.password = "securePassword";
    player1.language = "English";
    player1.colors = "Red";
    player1.photoIndex = 5;
    player1.isRegistered = true;
    player1.matches = [];
    player1.friends = [];
    fakeDatabase.push(player1);

    let player2 = createPlayerStats();
    player2.nickname = "ProGamer";
    player2.firstName = "Jane";
    player2.lastName = "Smith";
    player2.mail = "jane.smith@example.com";
    player2.password = "password123";
    player2.language = "Spanish";
    player2.colors = "Blue";
    player2.photoIndex = 7;
    player2.isRegistered = true;
    player2.matches = [];
    player2.friends = ["Gamer123"];
    player2.matches.push(new MatchResult(3, 1, "Keftark", '10', true));
    fakeDatabase.push(player2);
}

export function searchDatabase(nickname)
{
    let player = fakeDatabase.find(p => p.nickname === nickname);
    if (player)
        return player;
    return null;
}

export function isInTheDatabase(nickname)
{
    return fakeDatabase.some(p => p.nickname === nickname);
}

function goDatabase()
{
    setTimeout(() => {
        createFakeDatabase();
    }, 50);
}

goDatabase();
