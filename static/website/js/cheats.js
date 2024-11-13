import { sendSystemMessage } from "./chat.js";
import { setDuelTargetPlayer } from "./duelPanel.js";
import { changeBallSizeInstance, changeBallSpeedInstance, changePlayersSize } from "./levelLocal.js";
import { askForDuel } from "./menu.js";

export const cheatCodes =
{
    "/BALLSIZE" : changeBallSize,
    "/BALLSPEED" : changeBallSpeed,
    "/PADDLESIZE" : changePaddlesSize,
    "/DUEL" : sendInvitDuel
}

function changeBallSize(newSize)
{
    changeBallSizeInstance(newSize);
    sendSystemMessage("ballSizeChanged", newSize);
}

function changeBallSpeed(newSpeed)
{
    changeBallSpeedInstance(newSpeed);
    sendSystemMessage("ballSpeedChanged", newSpeed);
}

function changePaddlesSize(newSize)
{
    changePlayersSize(newSize)
    sendSystemMessage("paddleSizeChanged", newSize);
}

function sendInvitDuel(playerInvit = "")
{
    askForDuel();
    if (playerInvit != "")
        setDuelTargetPlayer(playerInvit)
}