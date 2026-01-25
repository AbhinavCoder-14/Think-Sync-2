"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2 } from 'lucide-react';
import PixelSnow from '@/components/PixelSnow';

import { useSocket } from '@/app/context/SocketContext';

export default function WaitingRoom({ roomId, players }: { roomId: string, players: any[] }) {

  const socket: any = useSocket()

  const [userCount, setuserCount] = useState(0);


  useEffect(() => {
    socket.on("user_count", (data: any) => {
      setuserCount(data.count)
      console.log(data.count)
    })
    return () => {
      socket.off("user_count");
    }
  },[])



  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      <PixelSnow density={0.1} speed={0.5} variant="snowflake" className="z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-2xl p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <span className="px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono mb-4 inline-block">
            ROOM ID: {roomId}
          </span>
          <h1 className="text-4xl font-bold text-foreground mt-2">Get Ready to Sync!</h1>
          <p className="text-muted-foreground mt-2">Waiting for the host to start the quiz...</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {players.map((player, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium truncate">{player.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users size={18} />
            <span>{userCount.toString()} players joined</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}