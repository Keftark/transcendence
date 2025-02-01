import { setUserPaddleSkin } from "./apiFunctions.js";
import { playerStats } from "./playerManager.js";

const choosePaddlePanel = document.getElementById('choosePaddlePanel');
const paddleList = document.getElementById('choosePaddleList');


document.getElementById('choosePaddle1Button').addEventListener('click', () => {
    choosePaddleSkin(1);
});
document.getElementById('choosePaddle2Button').addEventListener('click', () => {
    choosePaddleSkin(2);
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
    const nb = parseInt(nbr);
    if (playerStats.currentPaddleSkin != nb)
    {
        playerStats.currentPaddleSkin = nb;
        setUserPaddleSkin(playerStats.id, nb)
        .then(() => {
            closePaddleChoice();
        })
        .catch(error => {
            console.error("Error updating paddle skin:", error);
        });
    }
    else
        closePaddleChoice();
}