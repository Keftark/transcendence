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
	VOLCANO: 2,
	GRASSLAND: 3,
	0: "Cave",
	1: "Space",
	2: "Volcano",
	3: "Grasslands"
}

export const VictoryType =
{
    VICTORY: 0,
    DEFEAT: 1,
    EXAEQUO: 2
}

export const BallStats =
{
	baseRadius: 0.7,
	speedLimit: 8,
	maxBounceAngle: 75 * Math.PI / 180,
	baseSpeed: 0.65,
	baseIntensityIncrement: 0.005
}

export const PlayerStatus =
{
    OFFLINE: 0,
    ONLINE: 1,
	BUSY: 2
}

export const EmotionType = 
{
    NORMAL: 0,
	FEAR: 1,
	ANGER: 2,
	SAD: 3,
	LOVE: 4
}