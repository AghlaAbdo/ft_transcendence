

export const getFrameByPoints = (points: number) : string => {

    const ranks = ["silver", "gold", "sapphire", "amethyst"];
    const framesPerRank = 3;       
    const pointsPerFrame = 10;      

    console.log("player Points: ", points);
    if (points <= 0) points = 1;

    const index = Math.floor((points - 1) / pointsPerFrame);
    const rankIndex = Math.floor(index / framesPerRank);
    const frameNumber = (index % framesPerRank) + 1;

    const rankName = ranks[rankIndex] || ranks[ranks.length - 1];
    const framePath = `/frames/${rankName}${frameNumber}.png`;
    console.log("frame path: ", framePath);

    return framePath; 
}