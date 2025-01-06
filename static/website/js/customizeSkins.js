import { getCurrentView } from "./pages.js";
import { playerStats } from "./playerManager.js";

const choosePaddlePanel = document.getElementById('choosePaddlePanel');

let paddleChoiceIsOpen = false;
let currentPlayer = -1;

export function clickChoosePaddleButton(nbr = -1)
{
    if (nbr != -1)
        currentPlayer = nbr;
    paddleChoiceIsOpen = true;
    choosePaddlePanel.style.display = "flex";
    document.getElementById('choosePaddleList').children[0].focus();
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
    currentPlayer = -1;
    paddleChoiceIsOpen = false;
    const currentView = getCurrentView();
    if (currentView === 'rules')
        document.getElementById('choosePaddleButton').focus();
    choosePaddlePanel.classList.remove("appearing");
    setTimeout(() => {
        choosePaddlePanel.style.display = "none";
    }, 100);
}

export function choosePaddleSkin(nbr)
{
    if (getCurrentView() === "duel")
    {
        document.getElementById(`choosePaddleImgPlayer${currentPlayer}`).src = `static/images/paddle${nbr}Img.webp`;
        document.getElementById(`choosePaddleButtonPlayer${currentPlayer}`).focus();
    }
    else if (getCurrentView() === "home")
    {
        document.getElementById(`mainCustomizeButton`).focus();
    }
    else
        document.getElementById('choosePaddleImg').src = `static/images/paddle${nbr}Img.webp`;

    if (playerStats.currentPaddleSkin != nbr)
    {
        playerStats.currentPaddleSkin = nbr;
        // envoyer le changement au backend
    }
    // envoyer nbr au serveur lors d'un match online
    // genre setPaddleSkin(nbr, playerId);
    closePaddleChoice();
}