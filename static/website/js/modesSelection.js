import { openRules, setCustomRules } from './rules.js';
import { sendInvitationDuel } from './chat.js';
import { getLevelState, setLevelState } from './main.js';
import { LevelMode } from './variables.js';
import { navigateTo } from './pages.js';
import { playerStats } from './playerManager.js';

const modesLocalButton = document.getElementById('modesLocalButton');
const modesOnlineButton = document.getElementById('modesOnlineButton');

document.getElementById('modeLocalButton').addEventListener('click', () => {
    selectedMode = LevelMode.LOCAL;
    openRules();
});

document.getElementById('modeComputerButton').addEventListener('click', () => {
    selectedMode = LevelMode.ADVENTURE;
    openRules();
});

document.getElementById('modeDuelButton').addEventListener('click', () => {
    openDuelPanel();
});

document.getElementById('modeTournamentButton').addEventListener('click', () => {
    openTournamentMenu();
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
    closeBigModes();
    setTimeout(() => {
        isInsideModes = true;
        document.getElementById('modesSelectionParent').style.display = 'none';
        document.getElementById('modesLocal').style.display = 'flex';
        document.getElementById('modeLocalButton').focus();
    }, 300);
}

function clickModesOnline()
{
    if (!playerStats.isRegistered)
        return;
    closeBigModes();
    setTimeout(() => {
        isInsideModes = true;
        document.getElementById('modesSelectionParent').style.display = 'none';
        document.getElementById('modesOnline').style.display = 'flex';
        document.getElementById('modeDuelButton').focus();
    }, 300);
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
        closeInsideModes();
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