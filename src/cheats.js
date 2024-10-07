import { changeBallSizeInstance, changeBallSpeedInstance, changePlayersSize } from "./levelLocal";

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
