import { fakeDatabase } from "./database";
import { isVictory } from "./levelLocal";
import { changeTextsColor } from "./menu";
import { MatchResult } from "./scoreManager";
import { getTranslation } from "./translate";
const inputNick = document.getElementById('inputName');
const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputMail = document.getElementById('inputMail');
const inputPassword = document.getElementById('inputPassword');

export let playerStats = 
{
    nickname: "",
    firstName: "",
    lastName: "",
    mail: "",
    password: "",
    language: "en",
    colors: "white",
    photoIndex: 0,
    isRegistered: false,
    matches: [],
    friends: []
}

export function createPlayerStats() {
    return {
        nickname: "",
        firstName: "",
        lastName: "",
        mail: "",
        password: "",
        language: "",
        colors: "",
        photoIndex: 0,
        isRegistered: false,
        matches: [],
        friends: []
    };
}

export function addMatchToHistory(playerScore, opponentScore, opponentName)
{
    setTimeout(() => {
        playerStats.matches.push(new MatchResult(playerScore, opponentScore, opponentName));
    }, 50);
    // prendre le joueur depuis la base de donnees et inserer le nouveau score
}

export function createNewPlayer()
{
    let player = createPlayerStats();
    player.nickname = inputNick.value;
    player.firstName = inputFirstName.value;
    player.lastName = inputLastName.value;
    player.mail = inputMail.value;
    player.password = inputPassword.value;
    player.language = "en";
    player.photoIndex = 0;
    player.colors = "white";
    player.isRegistered = true;
    player.friends.push("ProGamer");
    fakeDatabase.push(player);
    playerStats = player;
    // playerStats.friends.push("Other");
}

export function resetPlayerStats()
{
    playerStats.nickname = getTranslation('guest');
    playerStats.firstName = "";
    playerStats.lastName = "";
    playerStats.mail = "";
    playerStats.password = "";
    playerStats.language = "en";
    playerStats.photoIndex = 0;
    playerStats.colors = "white";
    playerStats.matches = [];
    playerStats.friends = [];
    playerStats.isRegistered = false;
}

// on laisse le joueur choisir une image parmi une selection
export function changeProfilePicture(newIndex)
{
    playerStats.photoIndex = newIndex;
    // update la photo sur l'UI
}

export function changePlayerName(playerStats)
{
    // on change le nom dans la base de donnees et sur le profil.
}

export function loadPlayerConfig(playerStats)
{
    changeLanguage(playerStats.language);
    changeTextsColor(playerStats.colors);
}

export function getPlayerVictories(player = playerStats)
{
    const total = player.matches.length;
    let victories = 0;
    for (let i = 0; i < total; i++)
    {
        if (isVictory(player.matches[i]))
            victories++;
    }
    let percentage = victories * 100 / total;
    percentage = parseFloat(percentage.toFixed(2));
    return {total, victories, percentage};
}

addMatchToHistory(3, 5, "random");
addMatchToHistory(5, 3, "random2");