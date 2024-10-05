import { changeBallSizeInstance } from "./levelLocal";

export function changeBallSize(newSize)
{
    console.log("changed the ball size to " + newSize);
    changeBallSizeInstance(newSize);
}