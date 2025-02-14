import { sendMatch, sendMatchMulti } from "./apiFunctions.js";
import { changeTextsColor } from "./menu.js";
import { getRandomNumberBetween } from "./objects.js";
import { getTranslation } from "./translate.js";
import { PlayerStatus, VictoryType } from "./variables.js";

const inputNick = document.getElementById('inputName');
const inputFirstName = document.getElementById('inputFirstName');
const inputLastName = document.getElementById('inputLastName');
const inputMail = document.getElementById('inputMail');
const inputPassword = document.getElementById('inputPassword');
const maxId = 99999;

export let playerStats = createPlayerStats();

export function createPlayerStats() {
    return {
        id: "",
        nickname: "",
        firstName: "",
        lastName: "",
        mail: "",
        password: "",
        language: "en",
        colors: "#fffbf0",
        photoIndex: 0,
        room_id: -1,
        playerController: 1,
        currentPaddleSkin: 1,
        isRegistered: false,
        cameraOrthographic: false,
        matches: [],
        friends: [],
        blacklist: [],
        status: PlayerStatus.ONLINE
    };
}

export function addMatchToHistory(victoryType, playerScore, teamName, opponentScore, opponentName, matchTime = '0')
{
    if (!playerStats.isRegistered)
        return;
    console.trace("Adding match to history:\nplayer score: " + playerScore + "\nOpponent score: " + opponentScore + "\nOpponent name: " + opponentName);
    if (victoryType === VictoryType.VICTORY)
        sendMatch(teamName, opponentName, playerScore, opponentScore, matchTime);
}

export function addMatchToHistoryMulti(victoryType, playerScore, teamName, opponentScore, opponentName, matchTime = '0')
{
    if (!playerStats.isRegistered)
        return;
    const opponents = opponentName.split(/\r?\n/);
    const team = teamName.split(/\r?\n/);
    // console.log(team[0]);
    // console.log(team[1]);
    // console.log("VS");
    // console.log(opponents[0]);
    // console.log(opponents[1]);
    // console.log("Adding multi match to history:\nplayer score: " + playerScore + "\nOpponent score: " + opponentScore + "\nOpponent name: " + opponents);
    // console.log("Victory: " + victoryType);
    if (victoryType === VictoryType.VICTORY && team[0] === playerStats.nickname)
        sendMatchMulti(team[0], team[1], playerScore, opponents[0], opponents[1], opponentScore, matchTime);
}

export async function createNewPlayer()
{
    let player = createPlayerStats();
    player.nickname = inputNick.value;
    player.firstName = inputFirstName.value;
    player.lastName = inputLastName.value;
    player.mail = inputMail.value;
    player.password = inputPassword.value;
    player.language = playerStats.language;
    player.photoIndex = 0;
    player.room_id = -1;
    player.colors = playerStats.colors;
    player.isRegistered = true;
    player.cameraOrthographic = playerStats.cameraOrthographic;
    player.playerController = 1;
    player.status = PlayerStatus.ONLINE;
    const userData = await getUserInfos(inputNick.value);
    player.id = userData.id;
    playerStats = player;
}

export function editPlayerStats(userData)
{
    let player = createPlayerStats();
    player.nickname = userData.username;
    player.firstName = userData.first_name;
    player.lastName = userData.last_name;
    player.mail = userData.email;
    player.password = userData.password;
    player.isRegistered = true;
    player.status = PlayerStatus.ONLINE;
    player.id = userData.id;
    player.currentPaddleSkin = userData.preferredPaddle;

    player.language = userData.language;
    player.photoIndex = userData.photoIndex;
    player.colors = userData.color;
    player.cameraOrthographic = Boolean(userData.orthographicView);
    player.playerController = 1;

    playerStats = player;
    loadPlayerConfig();
}

export function resetPlayerStats()
{
    playerStats = createPlayerStats();
    loadPlayerConfig();
}

// on laisse le joueur choisir une image parmi une selection
export function changeProfilePicture(newIndex)
{
    playerStats.photoIndex = newIndex;
    // update la photo sur l'UI
}

// export function changePlayerName(playerStats)
// {
//     // on change le nom dans la base de donnees et sur le profil.
// }

export function loadPlayerConfig()
{
    
    if (typeof playerStats.language === "undefined")
        return;
    let buttonLang = document.querySelector(`button[data-language=${playerStats.language}]`);  
    buttonLang.click();
    document.getElementById('cameraType').children[Number(playerStats.cameraOrthographic)].click();
    document.getElementById('colorPickerReplacer').style.backgroundColor = playerStats.colors
    changeTextsColor(playerStats.colors);
}

export function getPlayerVictories(player = playerStats)
{
    const total = player.matches.length;
    let victories = 0;
    for (let i = 0; i < total; i++)
    {
        if (player.matches[i].victoryType === VictoryType.VICTORY)
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

export async function getUserInfos(username) {
    if (!username) {
        throw new Error("No username entered.");
    }

    try
    {
        const response = await fetch(`/get-user/${username}/`);
        const data = await response.json();

        if (data.error) {
            console.error(data.error);
            throw new Error("User not found!");
        }
        // console.log(data);
        return data;
    }
    catch (error)
    {
        console.error("Error fetching user data:", error);
        throw error;
    }
}

assignIdNewPlayer();