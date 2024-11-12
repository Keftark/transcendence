import { clickBackButtonMenu } from "./menu";

const victoryScreen = document.getElementById('victory');
const victoryPanel = document.getElementById('victoryPanel');

document.addEventListener("DOMContentLoaded", function() {
    victoryPanel.classList.add("grow-on-appear");
  });

export function callVictoryScreen(str)
{
    document.getElementById('victoryText').innerText = str;
    victoryScreen.style.display = 'flex';
}

window.closeVictoryScreen = closeVictoryScreen;
export function closeVictoryScreen()
{
    victoryScreen.style.display = 'none';
    victoryPanel.classList.remove("grow-on-appear");
    clickBackButtonMenu();
}