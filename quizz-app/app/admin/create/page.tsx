'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSocket } from "@/app/context/SocketContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Users, CheckCircle2, Sparkles, Loader2, Check } from "lucide-react";
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
  
  // AI Generation states
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Problem[]>([]);

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

  const handleGenerateQuestions = async () => {
    if (!questionPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation with 2 second delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use hardcoded questions but show as "generated"
    setGeneratedQuestions(dummyProblems);
    setIsGenerating(false);
    setHasGenerated(true);
  }

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

        // Use the generated questions (which are actually hardcoded)
        const questionsToUse = hasGenerated ? generatedQuestions : dummyProblems;
        socket.emit("add_problems", {
          roomId: newRoomId,
          problem: JSON.stringify(questionsToUse)
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

          {/* AI Question Generator */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Question Generator</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Powered by AI
              </span>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="e.g., Generate 10 questions on JavaScript fundamentals..."
                  value={questionPrompt}
                  onChange={(e) => setQuestionPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isGenerating && handleGenerateQuestions()}
                  disabled={isGenerating || hasGenerated}
                  className="h-12 pr-24"
                />
                <div className="absolute right-2 top-2">
                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={!questionPrompt.trim() || isGenerating || hasGenerated}
                    size="sm"
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : hasGenerated ? (
                      <>
                        <Check className="h-3 w-3" />
                        Generated
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI will generate quiz questions based on your prompt
              </p>
            </div>

            {/* Generation Loading State */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Generating questions...</p>
                        <p className="text-xs text-muted-foreground">AI is analyzing your prompt and creating quiz questions</p>
                      </div>
                    </div>
                    
                    {/* Fancy loading animation */}
                    <div className="mt-3 space-y-2">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: [0.3, 0.6, 0.3], x: 0 }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5,
                            delay: i * 0.2 
                          }}
                          className="h-2 bg-primary/20 rounded-full"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Questions Preview */}
            <AnimatePresence>
              {hasGenerated && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Generated Questions
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {generatedQuestions.length} questions
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {generatedQuestions.map((problem, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-lg bg-secondary/30 border border-border text-sm"
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-xs text-primary font-semibold mt-0.5">Q{index + 1}</span>
                            <span className="text-foreground flex-1">{problem.title}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Card */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Quiz Configuration
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• {hasGenerated ? generatedQuestions.length : dummyProblems.length} questions loaded</p>
              <p>• Multiple choice format</p>
              <p>• Real-time leaderboard tracking</p>
              <p>• 20 seconds per question</p>
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={createRoom}
            disabled={isCreatingRoom || isGenerating}
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
          <div className="pt-2">
            <p className="text-xs text-center text-muted-foreground">
              {!hasGenerated && "Use AI to generate custom questions or create with default questions"}
            </p>
            {hasGenerated && (
              <p className="text-xs text-center text-green-600 dark:text-green-400">
                ✓ Questions generated successfully
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}