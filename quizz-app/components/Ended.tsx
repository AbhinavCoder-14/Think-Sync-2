"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Home, RotateCcw } from 'lucide-react';
import PixelSnow from '@/components/PixelSnow';
import { Button } from './ui/button';

export default function QuizResults({ leaderboard }: { leaderboard: any[] }) {
  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center p-8 bg-background overflow-y-auto">
      <PixelSnow variant="snowflake" density={0.2} className="z-0" />

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 text-center mb-12">
        <Trophy size={64} className="text-yellow-500 mx-auto mb-4" />
        <h1 className="text-5xl font-extrabold tracking-tighter">Quiz Complete!</h1>
      </motion.div>

      {/* Podium */}
      <div className="z-10 flex items-end justify-center gap-4 mb-16 w-full max-w-2xl h-64">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center w-1/3">
            <span className="font-bold mb-2">{topThree[1].name}</span>
            <div className="w-full bg-slate-400/20 border-t-4 border-slate-400 h-24 rounded-t-xl flex items-center justify-center">
              <Medal className="text-slate-400" size={32} />
            </div>
          </div>
        )}
        {/* 1st Place */}
        {topThree[0] && (
          <div className="flex flex-col items-center w-1/3">
            <span className="font-bold mb-2 text-xl">{topThree[0].name}</span>
            <div className="w-full bg-yellow-500/20 border-t-4 border-yellow-500 h-40 rounded-t-xl flex items-center justify-center">
              <Trophy className="text-yellow-500" size={48} />
            </div>
          </div>
        )}
        {/* 3rd Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center w-1/3">
            <span className="font-bold mb-2">{topThree[2].name}</span>
            <div className="w-full bg-amber-700/20 border-t-4 border-amber-700 h-16 rounded-t-xl flex items-center justify-center">
              <Medal className="text-amber-700" size={24} />
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard */}
      <div className="z-10 w-full max-w-xl space-y-2 mb-12">
        {others.map((player, i) => (
          <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-card/30 border border-border">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-mono">#{i + 4}</span>
              <span className="font-medium">{player.name}</span>
            </div>
            <span className="font-bold text-primary">{player.score} pts</span>
          </div>
        ))}
      </div>

      <div className="z-10 flex gap-4">
        <Button size="lg" variant="outline" className="gap-2">
          <Home size={18} /> Back Home
        </Button>
        <Button size="lg" className="gap-2 bg-primary text-primary-foreground">
          <RotateCcw size={18} /> Play Again
        </Button>
      </div>
    </div>
  );
}