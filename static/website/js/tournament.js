import { setLevelState } from "./main.js";
import { navigateTo } from "./pages.js";
import { getTranslation } from "./translate.js";
import { LevelMode } from "./variables.js";

const nbrPlayersTournament = document.getElementById('nbrPlayersTournament');
const listplayersDiv = document.getElementById('listPlayersTournament');

let countPlayers = 0;
let maxPlayers = 0;

document.getElementById('cancelTournamentButton').addEventListener('click', () => {
    closeTournamentMenu();
});


export function onTournamentMenuOpen()
{
    setLevelState(LevelMode.TOURNAMENTLOBBY);
    document.getElementById('createTournamentButton').focus();
}

export function closeTournamentMenu()
{
    navigateTo('modes');
}

export function addPlayerToTournament(playerName)
{
    countPlayers++;
    nbrPlayersTournament.innerText = getTranslation('players') + countPlayers + "/" + maxPlayers;
    // ajouter le div avec le nom du joueur dans listplayersDiv
    // le joueur qui cree le tournoi trigger cette fonction une fois avec son pseudo
}