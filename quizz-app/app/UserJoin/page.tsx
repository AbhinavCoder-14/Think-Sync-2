
"use client"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSocket } from "../context/SocketContext"
import { redirect } from "next/navigation"
import WaitingRoom from "@/components/WaitingRoom"
import { count } from "console"



export default function UserJoin() {

    const socket:any = useSocket()
    const [roomId, setRoomId] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [IsJoined, setIsJoined] = useState<boolean>(false)

    const [UserId,setUserId] = useState<string>("")
    const [leaderboard, setLeaderboard] = useState<any>()
    const [currentState, setCurrentState] = useState<string>("NOT STARTED")
    const [currentProblem, setcurrentProblem] = useState<any>()
    const [userCount, setuserCount] = useState<Number>(0)

    const UserJoinBtn = () =>{

        
        if (roomId.length ===0 || username.length === 0){
            return "name or room id is missing";
        }
        
        console.log("joining request")
        
        
        socket.emit("join",{
            name:username,
            roomId:roomId
        })
        
        socket.on("userId" ,(data:any)=>{
            if(data.userId){
                setUserId(data.userId)
                setIsJoined(true)
            }
            return data.userId
        })        
        
        // redirect(`/quiz/${roomId}`) // no use of dynamic url of roomrId everything is working socket protocal
        
    }
    
    if(IsJoined){
        useEffect(()=>{
            socket.on("initilization",(data:any)=>{
                const {userId,state} = data;
                setCurrentState("NOT STARTED")
            })
            
            
            // socket.on("LEADERBOARD",(data:any)=>{
            //     setCurrentState("leaderboard")
            //     setLeaderboard(data.leaderboard)
            // })
            
            // socket.on("CHANGE_PROBLEM",(data:any)=>{
            //     setCurrentState("CHANGE_PROBLEM")
            //     setcurrentProblem(data.problem)
            // })
            
        },[])
        

        useEffect(()=>{
            socket.on("user_count",(data:any)=>{
                setuserCount(data.count)                
            })
            

        },[userCount])
        
        if(currentState==="NOT STARTED"){
            console.log("Enterd in not started condn")
            return(<>
                <WaitingRoom roomId={roomId} players={["12","234"]} count={userCount} />

            </>)

        }

        if(currentState==="CHANGE_PROBLEM")
        

            return (<>
                {/* quiz component */}
            </>)

        if (currentState==="leaderboard"){
            return (<>
            
                {/* leaderboard component */}
            
            </>)
        }

        return(<>
            Quiz has ended
        </>)

    }

     return (<>
        <div className="flex flex-col max-w-[50%] min-h-[90vh] justify-center align-middle m-auto">
        <div className="w-[50%] flex flex-col justify-center align-middle m-auto">

            <Input type="name" className="mt-2" placeholder="Enter Name" onChange={(e)=>{
                setUsername(e.target.value)

            }}/>
            <Input type="roomId" className="mt-2" placeholder="Enter RoomId" onChange={(e)=>{
                setRoomId(e.target.value)
            }}/>


            <Button type="submit"  className="cursor-pointer m-2" onClick={()=>UserJoinBtn()}>
                Join Quiz
            </Button>


        </div>


        </div>
    
    
    
    
    
    
    </>)

   

}