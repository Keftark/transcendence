import { openRules, setCustomRules } from './rules.js';
import { sendInvitationDuel } from './chat.js';
import { getLevelState, setLevelState } from './main.js';
import { LevelMode } from './variables.js';
import { navigateTo } from './pages.js';
import { playerStats } from './playerManager.js';

const modesLocalButton = document.getElementById('modesLocalButton');
const modesOnlineButton = document.getElementById('modesOnlineButton');
const modeDuelButton = document.getElementById('modeDuelButton');
const modeLocalButton = document.getElementById('modeLocalButton');
const modeComputerButton = document.getElementById('modeComputerButton');
const modeTournamentButton = document.getElementById('modeTournamentButton');

modeLocalButton.addEventListener('click', () => {
    selectedMode = LevelMode.LOCAL;
    closeLocalModes();
    setTimeout(() => {
        openRules();
    }, 300);
});

modeComputerButton.addEventListener('click', () => {
    selectedMode = LevelMode.ADVENTURE;
    closeLocalModes();
    setTimeout(() => {
        openRules();
    }, 300);
});

modeDuelButton.addEventListener('click', () => {
    closeOnlineModes();
    setTimeout(() => {
        openDuelPanel();
    }, 300);
});

modeTournamentButton.addEventListener('click', () => {
    closeOnlineModes();
    setTimeout(() => {
        openTournamentMenu();
    }, 300);
});

document.getElementById('createTournamentButton').addEventListener('click', () => {
    selectedMode = LevelMode.TOURNAMENTLOBBY;
    openRules(" ");
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
    modesLocalButton.style.animationDirection = 'normal';
    modesOnlineButton.style.animationDirection = 'normal';
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
        modeLocalButton.style.animationDirection = 'normal';
        modeComputerButton.style.animationDirection = 'normal';
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
        animOnlineModes();
    }, 300);
}

function animLocalModes()
{
    modeLocalButton.classList.add('littleAppearAnim');
    modeComputerButton.classList.add('littleAppearAnim');
}

function resetLocalAnim()
{
    modeLocalButton.classList.remove('littleAppearAnim');
    modeComputerButton.classList.remove('littleAppearAnim');
    void modeLocalButton.offsetWidth;
    void modeComputerButton.offsetWidth;
    animLocalModes();
}

function closeLocalModes()
{
    modeLocalButton.style.animationDirection = 'reverse';
    modeComputerButton.style.animationDirection = 'reverse';
    resetLocalAnim();
}

function resetOnlineAnim()
{
    animReverse = false;
    modeDuelButton.style.animationDirection = 'normal';
    modeTournamentButton.style.animationDirection = 'normal';
}

function animOnlineModes()
{
    modeDuelButton.classList.add('littleAppearAnim');
    modeTournamentButton.classList.add('littleAppearAnim');
}

function closeOnlineModes()
{
    isOnlineModes = false;
    modeDuelButton.classList.remove('littleAppearAnim');
    modeTournamentButton.classList.remove('littleAppearAnim');
    void modeDuelButton.offsetWidth;
    void modeTournamentButton.offsetWidth;
    modeDuelButton.style.animationDirection = animReverse ? 'normal' : 'reverse';
    modeTournamentButton.style.animationDirection = animReverse ? 'normal' : 'reverse';
    animReverse = !animReverse;
    resetOnlineAnim();
    animOnlineModes();
}

function animBigModes()
{
    modesLocalButton.classList.add('bigAppearAnim');
    modesOnlineButton.classList.add('bigAppearAnim');
}

function closeBigModes()
{
    modesLocalButton.classList.remove('bigAppearAnim');
    modesOnlineButton.classList.remove('bigAppearAnim');
    void modesLocalButton.offsetWidth;
    void modesOnlineButton.offsetWidth;
    modesLocalButton.style.animationDirection = animReverse ? 'normal' : 'reverse';
    modesOnlineButton.style.animationDirection = animReverse ? 'normal' : 'reverse';
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