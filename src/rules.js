import { ArenaType } from "./main";

let rules =
{
    pointsToWin: 3,
    arena: ArenaType.SPACE, 
    maxTime: 0,
}

export function setDefaultRules()
{
    rules.pointsToWin = 3;
    rules.arena = ArenaType.SPACE;
    rules.maxTime = 0;
}

export function setCustomRules(newPointsToWin, newArena, newMaxTime)
{
    rules.pointsToWin = newPointsToWin;
    rules.arena = newArena;
    rules.maxTime = newMaxTime;
}

export function getRules()
{
    return rules;
}