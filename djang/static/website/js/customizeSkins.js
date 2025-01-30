import { playerStats } from "./playerManager.js";

const choosePaddlePanel = document.getElementById('choosePaddlePanel');
const paddleList = document.getElementById('choosePaddleList');


document.getElementById('choosePaddle1Button').addEventListener('click', () => {
    choosePaddleSkin(0);
});
document.getElementById('choosePaddle2Button').addEventListener('click', () => {
    choosePaddleSkin(1);
});

let paddleChoiceIsOpen = false;

export function clickChoosePaddleButton()
{
    paddleChoiceIsOpen = true;
    choosePaddlePanel.style.display = "flex";
    paddleList.children[playerStats.currentPaddleSkin - 1].focus();
    setTimeout(() => {
        choosePaddlePanel.classList.add("appearing");
    }, 100);
}

export function isPaddleChoiceOpen()
{
    return paddleChoiceIsOpen;
}

export function closePaddleChoice()
{
    paddleChoiceIsOpen = false;
    choosePaddlePanel.classList.remove("appearing");
    setTimeout(() => {
        choosePaddlePanel.style.display = "none";
    }, 100);
    document.getElementById('mainCustomizeButton').focus();
}

export function choosePaddleSkin(nbr)
{
    if (playerStats.currentPaddleSkin != nbr)
    {
        playerStats.currentPaddleSkin = nbr;
        // envoyer le changement au backend
    }
    // envoyer nbr au serveur lors d'un match online
    // genre setPaddleSkin(nbr, playerId);
    closePaddleChoice();
}