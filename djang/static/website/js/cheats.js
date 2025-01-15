import { addFriendFunction, clickBlockUser, receiveMessage, removeFriendFunction, sendSystemMessage } from "./chat.js";
import { setDuelTargetPlayer } from "./duelPanel.js";
import { removeBlockedUser } from "./friends.js";
import { changeBallSizeInstance, changeBallSpeedInstance, changePlayersSize, getBallPosition } from "./levelLocal.js";
import { askForDuel } from "./modesSelection.js";
import { playerStats } from "./playerManager.js";
import { sendPrivMessage, sendPrivSticker } from "./sockets.js";

export const cheatCodes =
{
    "/BALLSIZE" : changeBallSize,
    "/BALLSPEED" : changeBallSpeed,
    "/PADDLESIZE" : changePaddlesSize,
    "/DUEL" : sendInvitDuel,
    "/MSG" : sendPrivateMessage,
    "/BLOCK" : blockPlayer,
    "/UNBLOCK" : unblockPlayer,
    "/ADDFRIEND" : addFriend,
    "/REMOVEFRIEND" : deleteFriend,
    "/GBP" : getBallPos
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

function sendPrivateMessage(target = "", message = "")
{
    // console.log("Message to: " + target + ": " + message);
    sendPrivSticker(target, message);
    sendPrivMessage(target, message);
    receiveMessage(playerStats.nickname, message, false, true, target);
    // on check si le player existe dans la bdd et est connecte
    // si oui, on envoie un message prive et lui seul le recoit.
    // evidemment, le joueur voit ce qu'il ecrit.
    // mais peut-etre qu'il faudrait afficher ces messages d'une differente couleur.
}

function blockPlayer(playerName = "")
{
    if (playerName != "")
        clickBlockUser(playerName);
}

function unblockPlayer(playerName = "")
{
    if (playerName != "")
        removeBlockedUser(playerName);
}

function addFriend(playerName = "")
{
    if (playerName != "")
        addFriendFunction(playerName);
}

function deleteFriend(playerName = "")
{
    if (playerName != "")
        removeFriendFunction(playerName);
}

function getBallPos()
{
    getBallPosition();
}