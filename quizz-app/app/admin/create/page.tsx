'use client'
import { Button } from "@/components/ui/button"
import { useSocket } from "@/app/context/SocketContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { motion } from "framer-motion";
import { Copy, Users, CheckCircle2 } from "lucide-react";
import PixelSnow from "@/components/PixelSnow";

export interface Option {
  id: string;
  title: string;
}

export interface Problem {
  title: string;
  image: string;
  answer: string;
  options: Option[];
}

export const dummyProblems: Problem[] = [
  {
    title: "What is the output of '2' + 2 in JavaScript?",
    image: "https://dummyimage.com/600x400/000/fff&text=JS+Question",
    answer: "2",
    options: [
      { id: "1", title: "4" },
      { id: "2", title: "22" },
      { id: "3", title: "NaN" },
      { id: "4", title: "TypeError" },
    ],
  },
  {
    title: "Which keyword is used to define a function in Python?",
    image: "https://dummyimage.com/600x400/000/fff&text=Python+Code",
    answer: "1",
    options: [
      { id: "1", title: "def" },
      { id: "2", title: "function" },
      { id: "3", title: "func" },
      { id: "4", title: "define" },
    ],
  },
  {
    title: "What is the time complexity of accessing an array element by index?",
    image: "https://dummyimage.com/600x400/000/fff&text=Big+O",
    answer: "3",
    options: [
      { id: "1", title: "O(n)" },
      { id: "2", title: "O(log n)" },
      { id: "3", title: "O(1)" },
      { id: "4", title: "O(n log n)" },
    ],
  },
];

export default function Create() {
  const socket: any = useSocket()
  const [roomId, setRoomId] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState<number>(0);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: session } = useSession()

  useEffect(() => {
    if (!socket) {
      console.log("Entered in handle join useeffect but socket is null")
      return;
    }

    socket.on("user_count_admin", (data: any) => {
      console.log("Entered in live count admin update")
      if (data.count !== undefined) {
        setLiveCount(data.count)
      }
    })

    return () => {
      socket.off("user_count_admin");
    }
  }, [socket])

  const createRoom = () => {
    setIsCreatingRoom(true);
    const newRoomId = crypto.randomUUID();
    
    if (session?.user.role === "admin") {
      const ADMIN_ROOM_KEY = "1234"
      if (socket) {
        socket.emit("join_admin", {
          password: ADMIN_ROOM_KEY,
        })
        socket.emit("create_quiz", {
          roomId: newRoomId
        })

        setRoomId(newRoomId)

        socket.emit("add_problems", {
          roomId: newRoomId,
          problem: JSON.stringify(dummyProblems)
        })
      }
    }
    
    setIsCreatingRoom(false);
  }

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (roomId) {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center p-6 bg-background">
        <PixelSnow density={0.1} speed={0.5} variant="snowflake" className="z-0" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 w-full max-w-2xl mt-12"
        >
          <div className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Quiz Room Created!</h1>
              <p className="text-muted-foreground">Share this room ID with participants</p>
            </div>

            {/* Room ID Display */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Room ID</p>
                  <p className="text-lg font-mono font-semibold truncate">{roomId}</p>
                </div>
                <Button
                  onClick={copyRoomId}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Live Participants Count */}
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{liveCount}</p>
                <p className="text-sm text-muted-foreground">
                  {liveCount === 1 ? 'Participant' : 'Participants'} Joined
                </p>
              </div>
            </div>

            {/* Dashboard Component */}
            <Dashboard roomId={roomId} count1={liveCount} />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background">
      <PixelSnow density={0.1} speed={0.5} variant="snowflake" className="z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-2xl"
      >
        <div className="p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Create Quiz Room</h1>
            <p className="text-muted-foreground">Set up a new quiz session for your participants</p>
          </div>

          {/* Info Card */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Current Configuration
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• {dummyProblems.length} pre-loaded questions</p>
              <p>• Multiple choice format</p>
              <p>• Real-time leaderboard tracking</p>
              <p>• 20 seconds per question</p>
            </div>
          </div>

          {/* Questions Preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Question Preview</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {dummyProblems.map((problem, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-secondary/30 border border-border text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground mr-2">Q{index + 1}</span>
                  <span className="text-foreground">{problem.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={createRoom}
            disabled={isCreatingRoom}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isCreatingRoom ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Creating Room...
              </>
            ) : (
              'Create Quiz Room'
            )}
          </Button>

          {/* Footer Note */}
          <p className="text-xs text-center text-muted-foreground">
            Only administrators can create quiz rooms
          </p>
        </div>
      </motion.div>
    </div>
  )
}