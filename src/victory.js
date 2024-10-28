import { clickBackButtonMenu } from "./menu";

const victoryScreen = document.getElementById('victory');

export function callVictoryScreen(str)
{
    document.getElementById('victoryText').innerText = str;
    victoryScreen.style.display = 'flex';
}

window.closeVictoryScreen = closeVictoryScreen;
export function closeVictoryScreen()
{
    victoryScreen.style.display = 'none';
    clickBackButtonMenu();
}