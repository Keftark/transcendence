import { setSelectedMode, showModeChoice } from "./modesSelection.js";
import { socketExitLobby } from "./sockets.js";
import { LevelMode } from "./variables.js";

document.getElementById('leaveMultiButton').addEventListener('click', () => {
    closeMultiPanel();
});

export function closeMultiPanel()
{
    // double chargement de la page de retour pour le joueur qui quitte
    // mettre un message indiquant que l'autre joueur a quitte
    setSelectedMode(LevelMode.MENU);
    document.getElementById('waitingMatch').style.display = "none";
    socketExitLobby("2v2_classic");
    showModeChoice();
}