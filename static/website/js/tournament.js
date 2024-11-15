import { addDisableButtonEffect, removeDisableButtonEffect, setLevelState } from "./main.js";
import { navigateTo } from "./pages.js";
import { playerStats } from "./playerManager.js";
import { getRules } from "./rules.js";
import { getTranslation } from "./translate.js";
import { ArenaType, LevelMode } from "./variables.js";

const nbrPlayersTournament = document.getElementById('nbrPlayersTournament');
const listplayersDiv = document.getElementById('listPlayersTournament');
const buttonStartTournament = document.getElementById('startTournamentButton');
const rulesTextTournament = document.getElementById('rulesTextTournament');

let countPlayers = 0;
let maxPlayers = 0;
let tournamentLeader = "";

document.getElementById('cancelTournamentButton').addEventListener('click', () => {
    closeTournamentMenu();
});

document.getElementById('startTournamentButton').addEventListener('click', () => {
    startTournament();
});

document.getElementById('cancelTournamentLobbyButton').addEventListener('click', () => {
    closeTournamentLobbyMenu();
});

export function onTournamentMenuOpen()
{
    setLevelState(LevelMode.TOURNAMENTLOBBY);
    document.getElementById('createTournamentButton').focus();
}

function showTournamentRules()
{
    const rules = getRules();
    maxPlayers = rules.nbrPlayers;
    document.getElementById('rulesArenaValueTournament').textContent = ArenaType[rules.arena];
    document.getElementById('rulesPointsValueTournament').textContent = rules.pointsToWin;
    document.getElementById('rulesTimeValueTournament').textContent = rules.maxTime;
    document.getElementById('rulesPlayersValueTournament').textContent = rules.nbrPlayers;
}

export function onTournamentLobbyOpen(otherVar)
{
    if (otherVar != null) // c'est le createur du tournoi
    {
        tournamentLeader = playerStats.nickname;
        showTournamentRules();
    }
    // ajouter le joueur dans la base de donnees du tournoi
    // recuperer dans la base de donnees la liste des joueurs presents et les ajouter
    addPlayerToTournament(playerStats.nickname);
}

export function startTournament()
{
    if (buttonStartTournament.classList.contains('disabledButtonHover'))
        return;
    // code pour lancer le tournoi
}

export function closeTournamentMenu()
{
    navigateTo('modes');
}

function deleteEveryone()
{
    // suppression de tout le monde dans la base de donnees
    // suppression de tous les joueurs dans la liste
    while (listplayersDiv.firstChild)
        listplayersDiv.removeChild(listplayersDiv.firstChild);
}

export function closeTournamentLobbyMenu()
{
    deleteEveryone();
    navigateTo('tournament-menu');
}

function addPlayerToCount()
{
    countPlayers++;
    if (countPlayers === maxPlayers)
        removeDisableButtonEffect(buttonStartTournament);
    else
        addDisableButtonEffect(buttonStartTournament);
}

export function addPlayerToTournament(playerName)
{
    addPlayerToCount();
    nbrPlayersTournament.innerText = getTranslation('players') + " " + countPlayers + "/" + maxPlayers;
    const newPlayer = document.createElement('p');
    newPlayer.setAttribute('playerName', playerName);
    newPlayer.classList.add('playerTournament');
    if (playerName === tournamentLeader)
        newPlayer.classList.add('leaderTournament');
    const newPlayerName = document.createElement('div');
    newPlayerName.classList.add('playerNameTournament');
    newPlayerName.textContent = playerName;
    newPlayer.appendChild(newPlayerName);
    // ne pas afficher le bouton si le joueur qui rejoint n'est pas le leader
    const redCross = document.createElement('button');
    redCross.classList.add('redCrossButton');
    const redCrossImg = document.createElement('img');
    redCrossImg.src = '../static/icons/redCross.png';
    redCrossImg.classList.add('redCrossButtonImg');
    redCross.appendChild(redCrossImg);
    newPlayer.appendChild(redCross);
    listplayersDiv.appendChild(newPlayer);
}

function redCrossButtonClick()
{
    // on supprime le joueur du lobby, il revient donc a sa page precedente
    // le nom du joueur est supprime dans la base de donnees et son bouton aussi
}