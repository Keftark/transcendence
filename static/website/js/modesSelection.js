import { openRules, setCustomRules } from './rules.js';
import { sendInvitationDuel } from './chat.js';
import { getLevelState, setLevelState } from './main.js';
import { LevelMode } from './variables.js';
import { navigateTo } from './pages.js';
import { playerStats } from './playerManager.js';
import { isInGame } from './levelLocal.js';

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

modeLocalButton.addEventListener('click', () => {
    selectedMode = LevelMode.LOCAL;
    isInsideModes = false;
    closeLocalModes();
    setTimeout(() => {
        openRules();
    }, 300);
});

modeComputerButton.addEventListener('click', () => {
    selectedMode = LevelMode.ADVENTURE;
    isInsideModes = false;
    closeLocalModes();
    setTimeout(() => {
        openRules();
    }, 300);
});

modeDuelButton.addEventListener('click', () => {
    closeOnlineModes();
    isInsideModes = false;
    setTimeout(() => {
        openDuelPanel();
    }, 300);
});

mode2v2Button.addEventListener('click', () => {
    closeOnlineModes();
    isInsideModes = false;
    setTimeout(() => {
        open2v2Panel();
    }, 300);
});

modeTournamentButton.addEventListener('click', () => {
    closeOnlineModes();
    isInsideModes = false;
    setTimeout(() => {
        openTournamentMenu();
    }, 300);
});

document.getElementById('createTournamentButton').addEventListener('click', () => {
    selectedMode = LevelMode.TOURNAMENTLOBBY;
    openRules("t");
});

document.getElementById('joinTournamentButton').addEventListener('click', () => {
    joinTournament();
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

let isInsideModes = false;
let selectedMode;
let animReverse = false;
let isLocalModes = false;
let isOnlineModes = false;

export function clickPlayGame()
{
    setCustomRules();
    if (selectedMode === LevelMode.LOCAL)
        navigateTo('game-local', selectedMode);
    else if (selectedMode === LevelMode.ADVENTURE)
        navigateTo('game-ai', selectedMode);
    else if (selectedMode === LevelMode.DUEL)
    {
        sendInvitationDuel(playerStats.nickname);
        navigateTo('duel');
    }
    else if (selectedMode === LevelMode.TOURNAMENTLOBBY)
        navigateTo('tournament-lobby', selectedMode);
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
    selectedMode = LevelMode.MODESELECTION;
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
        modeTournament.style.animationDirection = 'normal';
        animOnlineModes();
    }, 300);
}

function animLocalModes()
{
    modeLocal.classList.add('littleAppearAnim');
    modeComputer.classList.add('littleAppearAnim');
}

function resetLocalAnim()
{
    modeLocal.classList.remove('littleAppearAnim');
    modeComputer.classList.remove('littleAppearAnim');
    void modeLocal.offsetWidth;
    void modeComputer.offsetWidth;
    animLocalModes();
}

function closeLocalModes()
{
    modeLocal.style.animationDirection = 'reverse';
    mode2v2.style.animationDirection = 'reverse';
    modeComputer.style.animationDirection = 'reverse';
    resetLocalAnim();
    isLocalModes = false;
}

function animOnlineModes()
{
    modeDuel.classList.add('littleAppearAnim');
    mode2v2.classList.add('littleAppearAnim');
    modeTournament.classList.add('littleAppearAnim');
}

function resetOnlineAnim()
{
    modeDuel.classList.remove('littleAppearAnim');
    mode2v2.classList.remove('littleAppearAnim');
    modeTournament.classList.remove('littleAppearAnim');
    void modeDuel.offsetWidth;
    void mode2v2.offsetWidth;
    void modeTournament.offsetWidth;
    animOnlineModes();
    isOnlineModes = false;
}

function closeOnlineModes()
{
    modeDuel.style.animationDirection = 'reverse';
    mode2v2.style.animationDirection = 'reverse';
    modeTournament.style.animationDirection = 'reverse';
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
        navigateTo('duel');
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
    if (selectedMode === LevelMode.DUEL || isInGame)
        return;
    selectedMode = LevelMode.DUEL;
    navigateTo('rules');
}