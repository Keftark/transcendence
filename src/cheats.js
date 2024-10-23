import { sendSystemMessage } from "./chat";
import { changeBallSizeInstance, changeBallSpeedInstance, changePlayersSize } from "./levelLocal";
import { getTranslation } from "./translate";

export const cheatCodes =
{
    "/BALLSIZE" : changeBallSize,
    "/BALLSPEED" : changeBallSpeed,
    "/PADDLESIZE" : changePaddlesSize
}

export function changeBallSize(newSize)
{
    changeBallSizeInstance(newSize);
    let siseStr = isNaN(newSize) ? 'its default value' : String(newSize);
    sendSystemMessage(getTranslation('ballSizeChanged') + siseStr);
}

export function changeBallSpeed(newSpeed)
{
    changeBallSpeedInstance(newSpeed);
    let speedStr = isNaN(newSpeed) ? 'its default value' : String(newSpeed);
    sendSystemMessage(getTranslation('ballSpeedChanged') + speedStr);
}

export function changePaddlesSize(newSize)
{
    changePlayersSize(newSize)
    let siseStr = isNaN(newSize) ? 'its default value' : String(newSize);
    sendSystemMessage(getTranslation('paddleSizeChanged') + siseStr);
}
