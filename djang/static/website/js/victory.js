import { callGameDialog } from "./chat.js";
import { isSpectator } from "./levelLocal.js";
import { getLevelState } from "./main.js";
import { clickBackButtonMenu } from "./modesSelection.js";
import { getCurrentView } from "./pages.js";
import { getPlayerName } from "./playerManager.js";
import { getTranslation } from "./translate.js";
import { EmotionType, LevelMode, VictoryType } from "./variables.js";

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
    const isLocal = getLevelState() === LevelMode.LOCAL || getLevelState() === LevelMode.TOURNAMENT;
    const playerName = isSpectator() || LevelMode.TOURNAMENT ? playerWon : getPlayerName();

    document.getElementById('closeVictoryButton').innerText = getCurrentView() === "game-tournament" ? getTranslation("next") : getTranslation("mainButton");

    switch (victoryType) {
        case VictoryType.VICTORY:
            str = isLocal || isSpectator() ? playerName + getTranslation('wins') : getTranslation('victory');
            newSrc = "static/images/victoryImg.webp";
            callGameDialog("entityVictory", EmotionType.LOVE);
            break;
        case VictoryType.DEFEAT:
            str = isLocal ? getTranslation('player2Name') + getTranslation('wins') : getTranslation('defeat');
            newSrc = isLocal ? "static/images/victoryImg.webp" : "static/images/defeatImg.webp";
            callGameDialog(isLocal ? "entityVictory" : "entityDefeat", EmotionType.ANGER);
            break;
        case VictoryType.EXAEQUO:
            str = getTranslation('exaequo');
            newSrc = "static/images/exaequoImg.webp";
            callGameDialog("entityExaequo", EmotionType.NORMAL);
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
    victoryPanel.classList.remove("grow-on-appear");
    clickBackButtonMenu();
    victoryScreen.classList.remove("appearing");
    victoryScreen.style.display = 'none';
}