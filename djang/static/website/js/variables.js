export const LevelMode = {
	MENU: 0,
	MODESELECTION: 1,
	ADVENTURE: 2,
	DUEL: 3,
	LOCAL: 4,
	TOURNAMENT: 5,
	MULTI: 6,
	ONLINE: 7,
};

export const ArenaType = 
{
    CAVE: 0,
    SPACE: 1,
	0: "Cave",
	1: "Space"
}

export const VictoryType =
{
    VICTORY: 0,
    DEFEAT: 1,
    EXAEQUO: 2
}

export const BallStats =
{
	baseRadius: 0.8,
	speedLimit: 3,
	maxBounceAngle: 75 * Math.PI / 180,
	baseSpeed: 0.75,
	baseIntensityIncrement: 0.005
}

export const PlayerStatus =
{
    OFFLINE: 0,
    ONLINE: 1,
	BUSY: 2
}