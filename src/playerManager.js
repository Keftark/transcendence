import { matchResult } from "./levelLocal";
import { changeTextsColor } from "./menu";
const inputNick = document.getElementById('inputName');
const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputMail = document.getElementById('inputMail');
const inputPassword = document.getElementById('inputPassword');

let playerStats = 
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
    matches: []
}

export function addMatchToHistory(scorePlayer, scoreOpponent)
{
    // prendre le joueur depuis la base de donnees et inserer le nouveau score
    playerStats.matches.push(matchResult(scorePlayer, scoreOpponent));
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
}

export function resetPlayerStats()
{
    playerStats.nickname = "";
    playerStats.firstName = "";
    playerStats.lastName = "";
    playerStats.mail = "";
    playerStats.password = "";
    playerStats.language = "en";
    playerStats.photoIndex = 0;
    playerStats.colors = "white";
    playerStats.matches = [];
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