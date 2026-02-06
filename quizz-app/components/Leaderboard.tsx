"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface Player {
  name: string;
  id: string;
  points: number;
}

interface LeaderboardProps {
  players: Player[];
  currentUserId?: string;
}

export default function Leaderboard({ players, currentUserId }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 0:
        return 'text-yellow-500';
      case 1:
        return 'text-slate-400';
      case 2:
        return 'text-amber-700';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <Trophy className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Current Standings</p>
        </motion.div>

        {/* Leaderboard List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center justify-between p-4 rounded-lg border
                ${
                  player.id === currentUserId
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card/40'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`text-xl font-bold w-8 text-center ${getMedalColor(index)}`}
                >
                  {index < 3 ? '●' : index + 1}
                </span>
                <div>
                  <p className="font-medium">{player.name}</p>
                  {player.id === currentUserId && (
                    <p className="text-xs text-primary">You</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{player.points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}