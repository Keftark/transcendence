import { openRules, setCustomRules } from './rules.js';
import { sendInvitationDuel } from './chat.js';
import { getLevelState, setLevelState } from './main.js';
import { LevelMode } from './variables.js';
import { navigateTo } from './pages.js';
import { playerStats } from './playerManager.js';

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

document.getElementById('modesLocalButton').addEventListener('click', () => {
    clickModesLocal();
});

document.getElementById('modesOnlineButton').addEventListener('click', () => {
    clickModesOnline();
});

let isInsideModes = false;
let selectedMode;

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

function closeInsideModes()
{
    isInsideModes = false;
    document.getElementById('modesLocal').style.display = 'none';
    document.getElementById('modesOnline').style.display = 'none';
    document.getElementById('modesSelectionParent').style.display = 'flex';
    document.getElementById('modesLocalButton').focus();
}

export function showModeChoice()
{
    closeInsideModes();
    navigateTo('modes');
    selectedMode = LevelMode.MODESELECTION;
}

function clickModesLocal()
{
    isInsideModes = true;
    document.getElementById('modesSelectionParent').style.display = 'none';
    document.getElementById('modesLocal').style.display = 'flex';
    document.getElementById('modeLocalButton').focus();
}

function clickModesOnline()
{
    if (!playerStats.isRegistered)
        return;
    isInsideModes = true;
    document.getElementById('modesSelectionParent').style.display = 'none';
    document.getElementById('modesOnline').style.display = 'flex';
    document.getElementById('modeDuelButton').focus();
}

export function onModesOpen()
{
    setLevelState(LevelMode.MODESELECTION);
    document.getElementById('modesLocalButton').focus();
}

export function clickBackButtonMenu()
{
    if (isInsideModes)
        closeInsideModes();
    else
        navigateTo('home', getLevelState());
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