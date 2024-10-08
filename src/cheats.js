import { changeBallSizeInstance, changeBallSpeedInstance, changePlayersSize } from "./levelLocal";

export const cheatCodes =
{
    "/BALLSIZE" : changeBallSize,
    "/BALLSPEED" : changeBallSpeed,
    "/PADDLESIZE" : changePaddlesSize
}

export function changeBallSize(newSize)
{
    changeBallSizeInstance(newSize);
}

export function changeBallSpeed(newSpeed)
{
    changeBallSpeedInstance(newSpeed);
}

export function changePaddlesSize(newSize)
{
    changePlayersSize(newSize)
}
