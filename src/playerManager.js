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
    language: "",
    colors: "",
    photoIndex: 0,
    isRegistered: false,
    matches: [],
    friends: []
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
    playerStats.nickname = inputNick.value;
    playerStats.firstName = inputFirstName.value;
    playerStats.lastName = inputLastName.value;
    playerStats.mail = inputMail.value;
    playerStats.password = inputPassword.value;
    playerStats.language = "en";
    playerStats.photoIndex = 0;
    playerStats.colors = "white";
    playerStats.isRegistered = true;
    playerStats.friends.push("Other");
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

export function getPlayerVictories()
{
    const total = playerStats.matches.length;
    let victories = 0;
    for (let i = 0; i < total; i++)
    {
        if (isVictory(playerStats.matches[i]))
            victories++;
    }
    let percentage = victories * 100 / total;
    percentage = parseFloat(percentage.toFixed(2));
    return {total, victories, percentage};
}

addMatchToHistory(3, 5, "random");
addMatchToHistory(5, 3, "random2");