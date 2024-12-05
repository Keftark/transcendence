import { getLevelState } from "./main.js";
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

export function callVictoryScreen(victoryType) {
    let str;
    let newSrc;
    const isLocal = getLevelState() === LevelMode.LOCAL;

    switch (victoryType) {
        case VictoryType.VICTORY:
            str = isLocal ? getPlayerName() + getTranslation('wins') : getTranslation('victory');
            newSrc = "static/images/victoryImg.png";
            break;
        case VictoryType.DEFEAT:
            str = isLocal ? getTranslation('playernameright') + getTranslation('wins') : getTranslation('defeat');
            newSrc = isLocal ? "static/images/victoryImg.png" : "static/images/defeatImg.png";
            break;
        case VictoryType.EXAEQUO:
            str = getTranslation('exaequo');
            newSrc = "static/images/exaequoImg.png";
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