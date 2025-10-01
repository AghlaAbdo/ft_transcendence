import Image from "next/image";

interface Match {
  player: string;
  playerAvatar: string;
  opponent: string;
  opponentAvatar: string;
  score: string;
}

const matches: Match[] = [
  {
    player: "username1",
    playerAvatar: "/avatars/avatar3.png",
    opponent: "username2",
    opponentAvatar: "/avatars/avatar2.png",
    score: "7 : 3",
  },
  {
    player: "username1",
    playerAvatar: "/avatars/avatar3.png",
    opponent: "username3",
    opponentAvatar: "/avatars/avatar3.png",
    score: "2 : 8",
  },
  {
    player: "username1",
    playerAvatar: "/avatars/avatar3.png",
    opponent: "username4",
    opponentAvatar: "/avatars/avatar4.png",
    score: "3 : 1",
  },
  {
    player: "username1",
    playerAvatar: "/avatars/avatar3.png",
    opponent: "username2",
    opponentAvatar: "/avatars/avatar2.png",
    score: "9 : 8",
  },
    {
    player: "username1",
    playerAvatar: "/avatars/avatar3.png",
    opponent: "username2",
    opponentAvatar: "/avatars/avatar2.png",
    score: "9 : 8",
  },
    {
    player: "username1",
    playerAvatar: "/avatars/avatar3.png",
    opponent: "username2",
    opponentAvatar: "/avatars/avatar2.png",
    score: "9 : 8",
  },
];


export function GameHistory() {
  return (
    <div className="w-full flex flex-col gap-4">
      {matches.map((match, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-[#1F2937] border border-slate-700 rounded-2xl px-6 py-4 hover:bg-[#1b2235] transition"
        >
          {/* Left: Player */}
          <div className="flex items-center gap-4">
            <Image
              src={match.playerAvatar}
              alt={match.player}
              width={50}
              height={50}
              className="rounded-full"
            />
            <span className="font-semibold text-xl">{match.player}</span>
          </div>

          {/* Score */}
          {/* <span className="px-6 py-2 border-2 border-purple-500 rounded-full font-bold text-lg">
            {match.score}
          </span> */}

        <span className="px-4 py-1 border-2 border-purple-500 rounded-full font-bold text-sm md:text-base">
              {match.score}
        </span>

          {/* Right: Opponent */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-xl">{match.opponent}</span>
            <Image
              src={match.opponentAvatar}
              alt={match.opponent}
              width={50}
              height={50}
              className="rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GameHistory1() {
  return (
    <div className="bg-[#0d1323] rounded-2xl p-4 shadow-lg text-white max-w-3xl mx-auto">
      {/* Header */}
      {/* <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          🎮 Game History
        </h2>
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          👥 Friends
        </h2>
      </div> */}

      {/* Matches */}
      <div className="space-y-3">
        {matches.map((match, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-[#1F2937] rounded-xl px-4 py-3 hover:bg-[#1b2235] transition"
          >
            {/* Left: Player */}
            <div className="flex items-center gap-3">
              <Image
                src={match.playerAvatar}
                alt={match.player}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">{match.player}</span>
            </div>

            {/* Score */}
            <span className="px-4 py-1 border-2 border-purple-500 rounded-full font-bold text-sm md:text-base">
              {match.score}
            </span>

            {/* Right: Opponent */}
            <div className="flex items-center gap-3">
              <span className="font-medium">{match.opponent}</span>
              <Image
                src={match.opponentAvatar}
                alt={match.opponent}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




export default {GameHistory, GameHistory1};