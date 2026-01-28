"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSocket } from "../context/SocketContext"
import WaitingRoom from "@/components/WaitingRoom"


interface Player {
    name: string;
  id: string;
  points: number;
}


export interface QuizProblem {
    problemId: string;
    title: string;
    image: string;
    options: { // Note: Your backend uses 'option' (singular) or 'options' depending on the file
      id: number;
      title: string;
    }[]; 
  }


  export interface QuizState {
    type: "NOT STARTED" | "CHANGE_PROBLEM" | "LEADERBOARD" | "QUIZ_ENDED";
    problem?: QuizProblem;
    leaderboard?: Player[];
  }

  interface CurrentStateQuizResponse {
    state: {
        type:"NOT STARTED" | "CHANGE_PROBLEM" | "LEADERBOARD" | "QUIZ_ENDED";
    }
    problem?: {
      problemId: string;
      title: string;
      image: string;
      option: { id: number; title: string };
    };
    getLeaderboard?: any[]; // Matches the key in your sendLeaderBoard() emit
  }


export default function UserJoin() {
    const socket: any = useSocket()
    const [roomId, setRoomId] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [isJoined, setIsJoined] = useState<boolean>(false) // Changed convention to camelCase
    const [userId1, setUserId1] = useState<string>("")
    const [userCount, setUserCount] = useState<number>(0)
    const [allUserList, setallUserList] = useState<any[]>([])

    const [currentState, setCurrentState] = useState<string>("NOT STARTED")

    const [currentProblem, setCurrentProblem] = useState<QuizProblem | null>(null);
const [leaderboard, setLeaderboard] = useState<Player[]>([]);

    useEffect(() => {
        if (!socket) {
            console.log("Entered in handle join useeffet but socket is null")
            return;
        }
        socket.on("user_count", (data: any) => {
            console.log("Broadcast received:", data.count);
            setUserCount(data.count);
            setallUserList(data.allUser)
        });

        console.log("enterd in the handle join useEffect")
        socket.on("initilization", (data: any) => {
            console.log("enterd in init")
            if (data.userId) {
                setUserId1(data.userId)
                setIsJoined(true)
                if (data.count) {
                    setUserCount(data.count)
                }
                if (data.allUser) setallUserList(data.allUser)
                console.log("----", allUserList)

                if (data.state && data.state.type) {
                    setCurrentState(data.state.type)
                }

            }
        })

        socket.on("currentStateQuiz",(data:CurrentStateQuizResponse)=>{
            setCurrentState(data.state.type)
            if (data.state && data.state.type==="CHANGE_PROBLEM") {
                console.log("enterd in current state - ", data.state.type)
                if(data.problem){
                    setCurrentProblem(data.problem)

                }


            }

            if (data.state && data.state.type==="LEADERBOARD"){

                console.log("enterd in current state - ", data.state.type)


            }
        })


        return () => {
            socket.off("initilization");
            socket.off("user_count");
            socket.off("currentStateQuiz");
        }

    }, [socket])

    const handleJoin = () => {
        if (!roomId || !username || !socket) {
            alert("Please enter both name and room ID");
            return;
        }
        socket.emit("join", {
            name: username,
            roomId: roomId
        })

        // socket.on("user_count", (data: any) => {
        //     console.log("enterd in user_count")
        //     setUserCount(data.count)
        //   })


        // socket.on("initilization", (data: any) => {
        //     console.log("enterd in the handle join")
        //     if (data.userId) {
        //         setUserId1(data.userId)
        //         setIsJoined(true)

        //         if (data.state && data.state.type) {
        //             setCurrentState(data.state.type)
        //         }
        //     }
        // })

        // socket.on("user_count", (data: any) => {
        //     console.log(data.count)
        // })
    }

    if (isJoined) {
        if (currentState === "NOT STARTED") {
            if (userCount || allUserList) {
                return <WaitingRoom roomId={roomId} players={allUserList ? allUserList : []} count={userCount} />
            }
        }

        if (currentState === "CHANGE_PROBLEM") {
            console.log("Entered in change_problem")
            return <div>Quiz Component Here</div>
        }

        if (currentState === "LEADERBOARD") {
            return <div>Leaderboard Component Here</div>
        }
        if (currentState === "QUIZ_ENDED") {
            return <div>Quiz has ended</div>

        }
    }

    return (
        <div className="flex flex-col max-w-[50%] min-h-[90vh] justify-center align-middle m-auto">
            <div className="w-[50%] flex flex-col justify-center align-middle m-auto">
                <Input
                    className="mt-2"
                    placeholder="Enter Name"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    className="mt-2"
                    placeholder="Enter RoomId"
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <Button className="cursor-pointer m-2" onClick={handleJoin}>
                    Join Quiz
                </Button>
            </div>
        </div>
    )
}