"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


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
  const router = useRouter();
  

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/game/games?userId=${id}`, {
          method: 'GET',
          credentials: "include"
        });
        if (!response.ok) 
          throw new Error('Failed to fetch games');
        const data : { games : Match[] } = await response.json();

        const enrichedMatches = await Promise.all(
          data.games.map(async (match: EnrichedMatch) => {
            const [playerRes1, playerRes2] = await Promise.all([
              fetch(`${process.env.NEXT_PUBLIC_API}/api/users/profile/${match.player1_id}`, {
                credentials: "include"
              }),
              fetch(`${process.env.NEXT_PUBLIC_API}/api/users/profile/${match.player2_id}`, {
                credentials: "include"
              }),
            ]);

            if (!playerRes1.ok || !playerRes2.ok) {
              throw new Error ('Failed to fetch player dataFa');
            }

            const [player1, player2] = await Promise.all([
              playerRes1.json(), 
              playerRes2.json()
            ]);

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
  }, [id]);

  const handleViewProfile = (id: number) => {
    router.push(`/profile/${id}`);
  }

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

            <div className="flex flex-1 items-center gap-3 ml-auto justify-end hover:text-violet-600 transition-colors duration-200">
              <button onClick={() => {
                if (opponent?.id !== undefined) {
                  handleViewProfile(opponent?.id);
                }
              }}>
                <span className="font-medium">{opponent?.username}</span>
              </button>
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
          
      </div>
    </div>
  );
}


export default { GameHistory };
