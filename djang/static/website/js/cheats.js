import { askAddFriendFunction, clickBlockUser, helpFunctionDisplay, receiveMessage, removeFriendFunction, sendPubSticker, sendSystemMessage } from "./chat.js";
import { setDuelTargetPlayer } from "./duelPanel.js";
import { removeBlockedUser } from "./friends.js";
import { changeBallSizeInstance, changeBallSpeedInstance, changePlayersSize, getBallPosition } from "./levelLocal.js";
import { isAnOfflineMode } from "./main.js";
import { askForDuel } from "./modesSelection.js";
import { getCurrentView } from "./pages.js";
import { playerStats } from "./playerManager.js";
import { socketSendPrivMessage, socketSendPrivSticker } from "./sockets.js";

export const cheatCodes =
{
    "/HELP" : helpFunction,
    "/BALLSIZE" : changeBallSize,
    "/BALLSPEED" : changeBallSpeed,
    "/PADDLESIZE" : changePaddlesSize,
    "/GBP" : getBallPos,
    "/DUEL" : sendInvitDuel,
    "/MSG" : sendPrivateMessage,
    "/BLOCK" : blockPlayer,
    "/UNBLOCK" : unblockPlayer,
    "/ADDFRIEND" : addFriend,
    "/REMOVEFRIEND" : deleteFriend,
    "/SAD" : () => sendSticker("sticker_sad"),
    "/HAPPY" : () => sendSticker("sticker_happy"),
    "/ANGRY" : () => sendSticker("sticker_angry"),
    "/COOL" : () => sendSticker("sticker_cool"),
    "/LAUGH" : () => sendSticker("sticker_laugh"),
    "/LOVE" : () => sendSticker("sticker_love"),
    "/PUKE" : () => sendSticker("sticker_puke"),
    "/SLEEP" : () => sendSticker("sticker_sleep"),
    "/WINK" : () => sendSticker("sticker_tongue_wink"),
    "/TRASH" : () => sendSticker("sticker_trash")
}

function helpFunction()
{
    helpFunctionDisplay();
}

function changeBallSize(newSize)
{
    if (!isAnOfflineMode(getCurrentView()))
    {
        sendSystemMessage("needOfflineMode", "");
        return;
    }
    changeBallSizeInstance(newSize);
    sendSystemMessage("ballSizeChanged", newSize);
}

function changeBallSpeed(newSpeed)
{
    if (!isAnOfflineMode(getCurrentView()))
    {
        sendSystemMessage("needOfflineMode", "");
        return;
    }
    changeBallSpeedInstance(newSpeed);
    sendSystemMessage("ballSpeedChanged", newSpeed);
}

function changePaddlesSize(newSize)
{
    if (!isAnOfflineMode(getCurrentView()))
    {
        sendSystemMessage("needOfflineMode", "");
        return;
    }
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
    socketSendPrivMessage(target, message);
    receiveMessage(playerStats.nickname, message, false, true, target);
}

function sendPrivateSticker(target = "", message = "")
{
    // console.log("Message to: " + target + ": " + message);
    socketSendPrivSticker(target, message);
    receiveMessage(playerStats.nickname, message, true, true, target);
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
        askAddFriendFunction(playerName);
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

function sendSticker(stickerName = "")
{
    sendPubSticker(stickerName);
}