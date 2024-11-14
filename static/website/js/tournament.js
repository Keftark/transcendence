import { setLevelState } from "./main.js";
import { navigateTo } from "./pages.js";
import { LevelMode } from "./variables.js";

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