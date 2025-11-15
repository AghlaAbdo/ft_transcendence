

export const getFrameByLevel = (level: number) : string => {

    const ranks = ["silver", "gold", "sapphire", "amethyst"];
    const framesPerRank = 3;       
    const levelPerFrame = 5;      

    // console.log("player level: ", level);
    if (level <= 0) level = 1;

    const index = Math.floor((level - 1) / levelPerFrame);
    const rankIndex = Math.floor(index / framesPerRank);
    const frameNumber = (index % framesPerRank) + 1;

    const rankName = ranks[rankIndex] || ranks[ranks.length - 1];
    const framePath = `/frames/${rankName}${frameNumber}.png`;
    // console.log("frame path: ", framePath);

    return framePath; 
}