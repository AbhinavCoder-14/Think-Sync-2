"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Home } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface Player {
  name: string;
  id: string;
  points: number;
}

interface QuizEndedProps {
  players: Player[];
  currentUserId?: string;
}

export default function QuizEnded({ players, currentUserId }: QuizEndedProps) {
  const router = useRouter();
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const currentPlayerRank =
    sortedPlayers.findIndex((p) => p.id === currentUserId) + 1;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
          <h1 className="text-4xl font-bold">Quiz Complete!</h1>
          {currentPlayerRank && (
            <p className="text-xl text-muted-foreground">
              You finished in{' '}
              <span className="text-primary font-semibold">
                #{currentPlayerRank}
              </span>{' '}
              place
            </p>
          )}
        </motion.div>

        {/* Top 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-center mb-4">
            Top Performers
          </h2>
          {sortedPlayers.slice(0, 3).map((player, index) => {
            const colors = [
              'border-yellow-500/50 bg-yellow-500/10',
              'border-slate-400/50 bg-slate-400/10',
              'border-amber-700/50 bg-amber-700/10',
            ];
            const medals = ['🥇', '🥈', '🥉'];

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`
                  flex items-center justify-between p-4 rounded-lg border
                  ${colors[index]}
                  ${player.id === currentUserId ? 'ring-2 ring-primary' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{medals[index]}</span>
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    {player.id === currentUserId && (
                      <p className="text-xs text-primary">You</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{player.points}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full gap-2"
            size="lg"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}