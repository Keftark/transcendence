import { fakeDatabase } from "./database.js";
import { isVictory } from "./levelLocal.js";
import { changeTextsColor } from "./menu.js";
import { getRandomNumberBetween } from "./objects.js";
import { MatchResult } from "./scoreManager.js";
import { getTranslation } from "./translate.js";
import { PlayerStatus } from "./variables.js";

const inputNick = document.getElementById('inputName');
const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputMail = document.getElementById('inputMail');
const inputPassword = document.getElementById('inputPassword');
const maxId = 99999;

export let playerStats = createPlayerStats();

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
        playerController: 0,
        isRegistered: false,
        cameraOrthographic: false,
        matches: [],
        friends: [],
        blacklist: [],
        status: PlayerStatus.ONLINE
    };
}

export function addMatchToHistory(playerScore, opponentScore, opponentName, matchTime = '0')
{
    setTimeout(() => {
        playerStats.matches.push(new MatchResult(playerScore, opponentScore, opponentName, matchTime));
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
    player.playerController = 0;
    player.status = PlayerStatus.ONLINE;
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
    playerStats.playerController = 0;
    playerStats.status = PlayerStatus.ONLINE;
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

export function getPlayerName()
{
    if (playerStats.isRegistered)
        return playerStats.nickname;
    return getTranslation('guest') + playerStats.id;
}

function assignIdNewPlayer()
{
    // verifier si c'est une nouvelle connexion
    let newId = Math.floor(getRandomNumberBetween(0, maxId));
    // check si l'id existe dans la base de donnees. Si oui, on refait un random dans une boucle
    playerStats.id = newId;
}

assignIdNewPlayer();