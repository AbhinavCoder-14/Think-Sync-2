
'use client'
import { Button } from "@/components/ui/button"
import { useSocket } from "@/app/context/SocketContext";
import { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";

interface session {
  name: string;
  email: string;
  sub: string;
  id: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface Option {
  id: string;
  title: string;
}

export interface Problem {
  title: string;
  image: string;
  answer: string; // Matches the Option ID
  options: Option[];
}

export const dummyProblems: Problem[] = [
  {
    title: "What is the output of '2' + 2 in JavaScript?",
    image: "https://dummyimage.com/600x400/000/fff&text=JS+Question",
    answer: "opt_2",
    options: [
      { id: "opt_1", title: "4" },
      { id: "opt_2", title: "22" }, // Correct Answer
      { id: "opt_3", title: "NaN" },
      { id: "opt_4", title: "TypeError" },
    ],
  },
  {
    title: "Which keyword is used to define a function in Python?",
    image: "https://dummyimage.com/600x400/000/fff&text=Python+Code",
    answer: "opt_1",
    options: [
      { id: "opt_1", title: "def" }, // Correct Answer
      { id: "opt_2", title: "function" },
      { id: "opt_3", title: "func" },
      { id: "opt_4", title: "define" },
    ],
  },
  {
    title: "What is the time complexity of accessing an array element by index?",
    image: "https://dummyimage.com/600x400/000/fff&text=Big+O",
    answer: "opt_3",
    options: [
      { id: "opt_1", title: "O(n)" },
      { id: "opt_2", title: "O(log n)" },
      { id: "opt_3", title: "O(1)" }, // Correct Answer
      { id: "opt_4", title: "O(n log n)" },
    ],
  },
];

export default function Create() {
  const socket: any = useSocket()
  const [roomId, setRoomId] = useState<string | null>();
  const [liveCount, setLiveCount] = useState<Number>(0)

  const { data: session } = useSession()

  useEffect(() => {
    if (!socket) {
      console.log("Entered in handle join useeffet but socket is null")
      return;
    }
    // socket.on("user_count", (data:any) => {
    //     console.log("Broadcast received:", data.count);
    //     setUserCount(data.count);
    // });
    // for starting the quiz
    console.log("Entered in live count")

    socket.on("user_count_admin", (data: any) => {
      console.log("Entered in live count 34534")
      if (data.count) {
        setLiveCount(data.count)
      }

    })


  }, [socket])

  const createRoom = () => {
    let roomId = crypto.randomUUID();
    if (session?.user.role === "admin") {
      console.log("user is autherize to create quiz room")
      const ADMIN_ROOM_KEY = "1234"
      if (socket) {
        socket.emit("join_admin", {
          password: ADMIN_ROOM_KEY,
        })
        socket.emit("create_quiz", {
          roomId: roomId
        })

        setRoomId(roomId)
        // Hardcoded the problem rn

        socket.emit("add_problems", {
          roomId: roomId,
          problem: JSON.stringify(dummyProblems)
        })
      }
    }


    // TODO: verify that the user is autherize or not to create room 
    // -- done

  }
  if (roomId) {
    return (
      <>
        your room is created the room Id is  {roomId}
        <Dashboard roomId={roomId} count1={liveCount} />
      </>
    )
  }




  return (
    <>

      <h1>Now you can create room with the clicking on btn</h1>
      <Button className="cursor-pointer" onClick={() => { createRoom() }} size="lg">Create Room</Button>
      <h1>Right now i have hardcoded the quiz questions</h1>
    </>
  )

}



