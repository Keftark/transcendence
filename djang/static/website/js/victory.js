import { isSpectator } from "./levelLocal.js";
import { getLevelState, isAnOnlineMode } from "./main.js";
import { clickBackButtonMenu } from "./modesSelection.js";
import { getPlayerName } from "./playerManager.js";
import { getTranslation } from "./translate.js";
import { LevelMode, VictoryType } from "./variables.js";

const victoryScreen = document.getElementById('victory');
const victoryPanel = document.getElementById('victoryPanel');
const victoryImg = document.getElementById('victoryImg');
const closeVictoryButton = document.getElementById('closeVictoryButton');

closeVictoryButton.addEventListener('click', () => {
    closeVictoryScreen();
});

export function callVictoryScreen(victoryType, playerWon = "") {
    let str;
    let newSrc;
    const isLocal = getLevelState() === LevelMode.LOCAL;
    const playerName = isSpectator() ? playerWon : getPlayerName();

    switch (victoryType) {
        case VictoryType.VICTORY:
            str = isLocal || isSpectator() ? playerName + getTranslation('wins') : getTranslation('victory');
            newSrc = "static/images/victoryImg.webp";
            break;
        case VictoryType.DEFEAT:
            str = isLocal ? getTranslation('player2Name') + getTranslation('wins') : getTranslation('defeat');
            newSrc = isLocal ? "static/images/victoryImg.webp" : "static/images/defeatImg.webp";
            break;
        case VictoryType.EXAEQUO:
            str = getTranslation('exaequo');
            newSrc = "static/images/exaequoImg.webp";
            break;
    }

    document.getElementById('victoryText').innerText = str;

    victoryImg.onload = function() {
        victoryScreen.style.display = 'flex';
        setTimeout(() => {
            victoryScreen.classList.add("appearing");
            victoryPanel.classList.add("grow-on-appear");
        }, 50);
        closeVictoryButton.focus();
    };
    victoryImg.src = newSrc;
}

export function closeVictoryScreen()
{
    // if (isAnOnlineMode(getLevelState()))
    // {
        
    // }
    victoryPanel.classList.remove("grow-on-appear");
    clickBackButtonMenu();
    victoryScreen.classList.remove("appearing");
    victoryScreen.style.display = 'none';
}