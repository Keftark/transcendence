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
        id: "",
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
        paddleSkins: [],
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

export async function createNewPlayer()
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
    player.paddleSkins.push(0);
    player.playerController = 0;
    player.status = PlayerStatus.ONLINE;
    const userData = await getUserInfos(inputNick.value);
    player.id = userData.id;
    
    fakeDatabase.push(player);
    playerStats = player;
    // playerStats.friends.push("Other");
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

    // player settings, voir avec autre chose que userData.
    player.language = userData.language;
    player.photoIndex = userData.photoIndex;
    player.colors = userData.colors;
    player.playerController = userData.playerController;
    player.paddleSkins = userData.paddleSkins;

    playerStats = player;
    // console.log("Player retrieved: " + player.nickname);
}

export function resetPlayerStats()
{
    playerStats.nickname = getTranslation('guest');
    playerStats.id = 0;
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