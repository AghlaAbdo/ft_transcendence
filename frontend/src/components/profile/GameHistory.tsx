"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

// interface Match {
//   player: string;
//   playerAvatar: string;
//   opponent: string;
//   opponentAvatar: string;
//   score: string;
// }

// const matches: Match[] = [
//   {
//     player: "username1",
//     playerAvatar: "/avatars/avatar3.png",
//     opponent: "username2",
//     opponentAvatar: "/avatars/avatar2.png",
//     score: "7 : 3",
//   },
//   {
//     player: "username1",
//     playerAvatar: "/avatars/avatar3.png",
//     opponent: "username3",
//     opponentAvatar: "/avatars/avatar3.png",
//     score: "2 : 8",
//   },
//   {
//     player: "username1",
//     playerAvatar: "/avatars/avatar3.png",
//     opponent: "username4",
//     opponentAvatar: "/avatars/avatar4.png",
//     score: "3 : 1",
//   },
//   {
//     player: "username1",
//     playerAvatar: "/avatars/avatar3.png",
//     opponent: "username2",
//     opponentAvatar: "/avatars/avatar2.png",
//     score: "9 : 8",
//   },
//     {
//     player: "username1",
//     playerAvatar: "/avatars/avatar3.png",
//     opponent: "username2",
//     opponentAvatar: "/avatars/avatar2.png",
//     score: "9 : 8",
//   },
//     {
//     player: "username1",
//     playerAvatar: "/avatars/avatar3.png",
//     opponent: "username2",
//     opponentAvatar: "/avatars/avatar2.png",
//     score: "9 : 8",
//   },
// ];

interface Match {
  player1_id: number,
  player1_score: number,
  player1_avatar: string,

  player2_id: number,
  player2_score: number,
  player2_avatar: string,

  played_at: string

}

interface FriendsProps {
  id: number;
}

interface User {
  id: number,
  username: string,
  avatar_url: string
}

interface EnrichedMatch extends Match {
  player1?: User;
  player2?: User;
}

export function GameHistory( { id } :  FriendsProps) {
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`https://localhost:8080/api/game/games?userId=${id}`, {
          method: 'GET',
          credentials: "include"
        });
        if (!response.ok) 
          throw new Error('Failed to fetch games');
        const data : { games : Match[] } = await response.json();

        const enrichedMatches = await Promise.all(
          data.games.map(async (match: EnrichedMatch) => {
            const [playerRes1, playerRes2] = await Promise.all([
              fetch(`https://localhost:8080/api/users/${match.player1_id}`),
              fetch(`https://localhost:8080/api/users/${match.player2_id}`),
            ]);

            if (!playerRes1.ok || !playerRes2.ok) {
              throw new Error ('Failed to fetch player dataFa');
            }

            const [player1, player2] = await Promise.all([
              playerRes1.json(), 
              playerRes2.json()
            ]);

            console.log(player1.user.avatar_url);
            console.log(player2.user.avatar_url);
            
            return { 
              ...match,
              player1: player1.user, 
              player2: player2.user
            };
          })
        );
        setMatches(enrichedMatches);

      } catch (error) {
        console.error('Error fetching match data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No matches yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1323] rounded-2xl p-4 shadow-lg text-white max-w-3xl mx-auto">

      <div className="space-y-3">
        {matches.map((match, index) => {

          const isPlayer1 = id === match.player1_id;
          const currentPlayer = isPlayer1 ? match.player1 : match.player2;
          const opponent = isPlayer1 ? match.player2 : match.player1;

          const currentScore = isPlayer1 ? match.player1_score : match.player2_score;
          const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;


          return (
            <div
              key={index}
              className="flex justify-between items-center bg-[#1F2937] rounded-xl px-4 py-3 hover:bg-[#1b2235] transition"
            >
            <div className="flex flex-1 items-center gap-3">
              <img
                src={currentPlayer?.avatar_url || "./avatars/avatar1.png"}
                alt={currentPlayer?.username || "player 1"}
                width={40}
                height={40}
                className="rounded-full"
              />


              <span className="font-medium">{currentPlayer?.username}</span>
            </div>

            {/* <div className="text-center mt-5">
              <span className="px-3 py-1 border-2 border-purple-500 rounded-full font-bold text-sm md:text-base">
                  {match.player1_score} : {match.player2_score}
              </span>

              <div className="text-purple-400 font-medium mt-1">
                {match.played_at}
              </div>
            </div> */}
            <div className="flex flex-1 flex-col items-center">
              <span
                className={`px-3 py-1 border-2 rounded-full font-bold text-sm md:text-base ${
                  currentScore > opponentScore
                    ? "border-green-500 text-green-400"
                    : currentScore < opponentScore
                    ? "border-red-500 text-red-400"
                    : "border-purple-500 text-purple-400"
                }`}
              >
                {currentScore} : {opponentScore}
              </span>

            </div>

            <div className="flex flex-1 items-center gap-3 ml-auto justify-end">
              <span className="font-medium">{opponent?.username}</span>
              <img
                src={opponent?.avatar_url || "./avatars/avatar1.png"}
                alt={opponent?.username || "Player 2"}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
          )
        })}
          
        {/* ))} */}
      </div>
    </div>
  );
}


export default { GameHistory };

// /api/users/[searchterm] --> true , object
// api/friends/[sdfds] --> re
// 