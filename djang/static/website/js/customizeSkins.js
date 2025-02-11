import { setUserPaddleSkin } from "./apiFunctions.js";
import { playerStats } from "./playerManager.js";

const choosePaddlePanel = document.getElementById('choosePaddlePanel');
const paddleList = document.getElementById('choosePaddleList');


// document.getElementById('choosePaddle1Button').addEventListener('click', () => {
//     choosePaddleSkin(1);
// });
// document.getElementById('choosePaddle2Button').addEventListener('click', () => {
//     choosePaddleSkin(2);
// });
// document.getElementById('choosePaddle3Button').addEventListener('click', () => {
//     choosePaddleSkin(3);
// });
// document.getElementById('choosePaddle4Button').addEventListener('click', () => {
//     choosePaddleSkin(4);
// });
let paddleChoiceIsOpen = false;

for (let i = 0; i < paddleList.children.length; i++) {
    paddleList.children[i].addEventListener('click', () => {
        choosePaddleSkin(i + 1);
    });
    }


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
        if (playerStats.isRegistered)
        {
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
    else
        closePaddleChoice();
}