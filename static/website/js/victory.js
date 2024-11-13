import { clickBackButtonMenu } from "./menu.js";
import { getTranslation } from "./translate.js";
import { VictoryType } from "./variables.js";

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

    switch (victoryType) {
        case VictoryType.VICTORY:
            str = getTranslation('victory');
            newSrc = "static/images/victoryImg.png";
            break;
        case VictoryType.DEFEAT:
            str = getTranslation('defeat');
            newSrc = "static/images/defeatImg.png";
            break;
        case VictoryType.EXAEQUO:
            str = getTranslation('exaequo');
            newSrc = "static/images/exaequoImg.png";
            break;
    }

    document.getElementById('victoryText').innerText = str;

    victoryImg.onload = function() {
        victoryScreen.style.display = 'flex';
        victoryPanel.classList.add("grow-on-appear");
        closeVictoryButton.focus();
    };
    victoryImg.src = newSrc;
}

export function closeVictoryScreen()
{
    victoryScreen.style.display = 'none';
    victoryPanel.classList.remove("grow-on-appear");
    clickBackButtonMenu();
}