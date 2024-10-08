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
    sendSystemMessage(getTranslation('ballSizeChanged') + newSize);
}

export function changeBallSpeed(newSpeed)
{
    changeBallSpeedInstance(newSpeed);
    sendSystemMessage(getTranslation('ballSpeedChanged') + newSpeed);
}

export function changePaddlesSize(newSize)
{
    changePlayersSize(newSize)
    sendSystemMessage(getTranslation('paddleSizeChanged') + newSize);
}
