

export const getFrameByPoints = (points: number) : string => {

    const ranks = ["silver", "gold", "sapphire", "amethyst"];
    const framesPerRank = 3;       
    const pointsPerFrame = 5;      

    if (points <= 0) points = 1;

    const index = Math.floor((points - 1) / pointsPerFrame);
    const rankIndex = Math.floor(index / framesPerRank);
    const frameNumber = (index % framesPerRank) + 1;

    const rankName = ranks[rankIndex] || ranks[ranks.length - 1];

    return `/frames/${rankName}${frameNumber}.png`; 
}