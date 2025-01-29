import { openRules, setCustomRules, setDefaultRules } from './rules.js';
import { sendInvitationDuel } from './chat.js';
import { getLevelState, setLevelState } from './main.js';
import { LevelMode } from './variables.js';
import { getCurrentView, navigateTo } from './pages.js';
import { playerStats } from './playerManager.js';
import { isInGame, passInfosPlayersToLevel } from './levelLocal.js';
import { checkAccessModes } from './registration.js';
import { socketAskListMatchs, socketConnectToDuel, socketSpectateMatch } from './sockets.js';
import { getUserName } from './apiFunctions.js';
import { closeTournamentView, openTournamentLobby } from './tournament.js';

const modesLocalButton = document.getElementById('modesLocalButton');
const modesOnlineButton = document.getElementById('modesOnlineButton');
const modeDuelButton = document.getElementById('modeDuelButton');
const mode2v2Button = document.getElementById('mode2v2Button');
const modeLocalButton = document.getElementById('modeLocalButton');
const modeComputerButton = document.getElementById('modeComputerButton');
const modeTournamentButton = document.getElementById('modeTournamentButton');
const modesLocal = document.getElementById('modesLocalDiv');
const modesOnline = document.getElementById('modesOnlineDiv');
const modeLocal = document.getElementById('modeLocalDiv');
const modeComputer = document.getElementById('modeComputerDiv');
const modeDuel = document.getElementById('modeDuelDiv');
const mode2v2 = document.getElementById('mode2v2Div');
const modeTournament = document.getElementById('modeTournamentDiv');

let isInsideModes = false;
let animReverse = false;
let isLocalModes = false;
let isOnlineModes = false;

modeLocalButton.addEventListener('click', () => {
    setSelectedMode(LevelMode.LOCAL);
    isInsideModes = false;
    closeLocalModes();
    setTimeout(() => {
        openRules();
    }, 300);
});

modeComputerButton.addEventListener('click', () => {
    setSelectedMode(LevelMode.ADVENTURE);
    isInsideModes = false;
    closeLocalModes();
    setTimeout(() => {
        openRules();
    }, 300);
});

modeDuelButton.addEventListener('click', () => {
    socketConnectToDuel();
    closeOnlineModes();
    isInsideModes = false;
    setTimeout(() => {
        openDuelPanel();
    }, 300);
});

mode2v2Button.addEventListener('click', () => {
    setSelectedMode(LevelMode.MULTI);
    closeOnlineModes();
    isInsideModes = false;
    setTimeout(() => {
        openRules();
    }, 300);
});

modeTournamentButton.addEventListener('click', () => {
    setSelectedMode(LevelMode.TOURNAMENT);
    closeLocalModes();
    isInsideModes = false;
    setTimeout(() => {
        openTournamentLobby();
    }, 300);
});

document.getElementById('modeBackButton').addEventListener('click', () => {
    clickBackButtonMenu();
});

modesLocalButton.addEventListener('click', () => {
    clickModesLocal();
});

modesOnlineButton.addEventListener('click', () => {
    clickModesOnline();
});

function setSelectedMode(newSelectedMode)
{
    localStorage.setItem('selectedMode', newSelectedMode);
}

export function getSelectedMode()
{
    return parseInt(localStorage.getItem('selectedMode'));
}

export function clickPlayGame()
{
    const selecMode = getSelectedMode();
    setCustomRules();
    if (selecMode === LevelMode.LOCAL)
        navigateTo('game-local', selecMode);
    else if (selecMode === LevelMode.ADVENTURE)
        navigateTo('game-ai', selecMode);
    else if (selecMode === LevelMode.MULTI)
        navigateTo('game-multi', selecMode);
    else if (selecMode === LevelMode.ONLINE)
        navigateTo('game-online', selecMode);
    else if (selecMode === LevelMode.TOURNAMENT)
        navigateTo('game-tournament', selecMode);
}

function resetBigModesAnim()
{
    animReverse = false;
    modesLocal.style.animationDirection = 'normal';
    modesOnline.style.animationDirection = 'normal';
}

function closeInsideModes()
{
    isInsideModes = false;
    
    document.getElementById('modesLocal').style.display = 'none';
    document.getElementById('modesOnline').style.display = 'none';
    document.getElementById('modesSelectionParent').style.display = 'flex';
    resetBigModesAnim();
    animBigModes();
    modesLocalButton.focus();
}

export function showModeChoice()
{
    closeInsideModes();
    navigateTo('modes');
    setSelectedMode(LevelMode.MODESELECTION);
}

function clickModesLocal()
{
    isLocalModes = true;
    closeBigModes();
    setTimeout(() => {
        isInsideModes = true;
        document.getElementById('modesSelectionParent').style.display = 'none';
        document.getElementById('modesLocal').style.display = 'flex';
        modeLocalButton.focus();
        modeLocal.style.animationDirection = 'normal';
        modeComputer.style.animationDirection = 'normal';
        modeTournament.style.animationDirection = 'normal';
        animLocalModes();
    }, 300);
}

function clickModesOnline()
{
    isOnlineModes = true;
    if (!playerStats.isRegistered)
        return;
    closeBigModes();
    setTimeout(() => {
        isInsideModes = true;
        document.getElementById('modesSelectionParent').style.display = 'none';
        document.getElementById('modesOnline').style.display = 'flex';
        modeDuelButton.focus();
        modeDuel.style.animationDirection = 'normal';
        mode2v2.style.animationDirection = 'normal';
        animOnlineModes();
    }, 300);
}

function animLocalModes()
{
    modeLocal.classList.add('littleAppearAnim');
    modeComputer.classList.add('littleAppearAnim');
    modeTournament.classList.add('littleAppearAnim');
}

function resetLocalAnim()
{
    modeLocal.classList.remove('littleAppearAnim');
    modeComputer.classList.remove('littleAppearAnim');
    modeTournament.classList.remove('littleAppearAnim');
    void modeLocal.offsetWidth;
    void modeComputer.offsetWidth;
    void modeTournament.offsetWidth;
    animLocalModes();
}

function closeLocalModes()
{
    modeLocal.style.animationDirection = 'reverse';
    mode2v2.style.animationDirection = 'reverse';
    modeComputer.style.animationDirection = 'reverse';
    modeTournament.style.animationDirection = 'reverse';
    resetLocalAnim();
    isLocalModes = false;
}

function animOnlineModes()
{
    modeDuel.classList.add('littleAppearAnim');
    mode2v2.classList.add('littleAppearAnim');
}

function resetOnlineAnim()
{
    modeDuel.classList.remove('littleAppearAnim');
    mode2v2.classList.remove('littleAppearAnim');
    void modeDuel.offsetWidth;
    void mode2v2.offsetWidth;
    animOnlineModes();
    isOnlineModes = false;
}

function closeOnlineModes()
{
    modeDuel.style.animationDirection = 'reverse';
    mode2v2.style.animationDirection = 'reverse';
    resetOnlineAnim();
}

function animBigModes()
{
    modesLocal.classList.add('bigAppearAnim');
    modesOnline.classList.add('bigAppearAnim');
}

function closeBigModes()
{
    modesLocal.classList.remove('bigAppearAnim');
    modesOnline.classList.remove('bigAppearAnim');
    void modesLocal.offsetWidth;
    void modesOnline.offsetWidth;
    modesLocal.style.animationDirection = animReverse ? 'normal' : 'reverse';
    modesOnline.style.animationDirection = animReverse ? 'normal' : 'reverse';
    animReverse = !animReverse;
    animBigModes();
}

export function onModesOpen()
{
    document.getElementById('modesLocal').style.display = 'none';
    document.getElementById('modesOnline').style.display = 'none';
    checkAccessModes();
    resetBigModesAnim();
    setLevelState(LevelMode.MODESELECTION);
    animBigModes();
    modesLocalButton.focus();
}

export function clickBackButtonMenu()
{
    if (isInsideModes)
    {
        if (isLocalModes)
            closeLocalModes();
        else if (isOnlineModes)
            closeOnlineModes();
        setTimeout(() => {
            closeInsideModes();
        }, 300);
    }
    else
    {
        if (getCurrentView() === LevelMode.TOURNAMENT)
        {
            closeTournamentView();
        }
        closeBigModes();
        setTimeout(() => {
            navigateTo('home', getLevelState());
        }, 300);
    }
}

export function onModesClose()
{
    // showMainMenu();
}

function openDuelPanel()
{
    if (playerStats.isRegistered)
    {
        navigateTo('duel');
        setSelectedMode(LevelMode.ONLINE);
    }
    // else
        
    // if otherPlayer != "" and if isInTheDatabase(otherPlayer), sends an invitation to this player
}

function open2v2Panel()
{
    if (playerStats.isRegistered)
        navigateTo('mode2v2', "2v2"); // faire la page 2v2 !
}

export function openTournamentMenu()
{
    if (playerStats.isRegistered)
        navigateTo('tournament-menu');
}

function joinTournament()
{
    navigateTo('tournament-join');
}

export function askForDuel()
{
    if (getSelectedMode() === LevelMode.DUEL || isInGame)
        return;
    console.log("asking for a duel");
    setSelectedMode(LevelMode.DUEL);
    sendInvitationDuel(playerStats.nickname);
    navigateTo('duel');
}

const matchListPanel = document.getElementById('listSpectateDivPanel');
const matchList = document.getElementById('spectateList');

document.getElementById('closeListSpectatePanel').addEventListener('click', () => {
    closeMatchList();
});

document.getElementById('buttonSpectate').addEventListener('click', () => {
    openMatchList();
});

let matchListIsOpen = false;

export function isMatchListOpen()
{
    return matchListIsOpen;
}

export function getListMatchs(data)
{
    const matchCount = data.length; // faire un compte des matchs ici
    if (matchCount === 0)
    {
        matchList.style.justifyContent = "center";
        matchList.textContent = "Nope, pas de match";
    }
    else
    {
        matchList.style.justifyContent = "start";
        matchList.textContent = "";
        const matchPromises = data.map(async (matchData) => {
            try {
                const [user1, user2] = await Promise.all([
                    getUserName(matchData.id_p1),
                    getUserName(matchData.id_p2)
                ]);

                const nameP1 = user1.username;
                const nameP2 = user2.username;

                addMatchToList(matchData.room_id, nameP1, nameP2);
            } catch (error) {
                console.error("Failed to get user names for match:", matchData, error);
            }
        });

        // Wait for all matches to be processed
        Promise.all(matchPromises).then(() => {
            if (matchList.children[0]) {
                matchList.children[0].focus();
            }
        });
    }
    matchListIsOpen = true;
    if (matchCount > 0)
        matchList.children[0].focus();

    return data;
}

export function openMatchList()
{
    socketAskListMatchs();
    matchList.style.justifyContent = "center";
    matchList.textContent = "Waiting...";
    matchListIsOpen = true;
    matchListPanel.style.display = 'flex';
}

export function closeMatchList()
{
    matchListPanel.style.display = 'none';
    while (matchList.firstChild)
        matchList.removeChild(matchList.firstChild);
    matchListIsOpen = false;
    document.getElementById('buttonSpectate').focus();
}

function addMatchToList(room_id, idp1, idp2)
{
    const matchContainer = document.createElement('button');
    matchContainer.classList.add('matchInList');
    const textContainer = document.createElement('p');
    matchContainer.classList.add('centeredText');
    textContainer.textContent = idp1 + " vs " + idp2;
    matchContainer.appendChild(textContainer);

    matchContainer.addEventListener("click", function () {
        setSelectedMode(LevelMode.ONLINE);// a changer selon le mode du match
        playerStats.playerController = -1;
        passInfosPlayersToLevel(idp1, idp2)
        .then(() => {
            clickPlayGame();
        })
        .catch((error) => {
            console.error("Failed to set up players' controllers:", error);
        });
        isInsideModes = false;
        socketSpectateMatch(room_id);
        playerStats.room_id = room_id;
        setDefaultRules();
    });
    matchList.appendChild(matchContainer);
}