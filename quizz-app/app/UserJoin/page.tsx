
"use client"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSocket } from "../context/SocketContext"



export default function UserJoin() {

    const socket:any = useSocket()
    const [roomId, setRoomId] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [IsJoined, setIsJoined] = useState<boolean>(false)

    const [UserId,setUserId] = useState<string>("")
    const [leaderboard, setLeaderboard] = useState<any>()
    const [currentState, setCurrentState] = useState("not_started")
    const [currentProblem, setcurrentProblem] = useState<any>()

    const UserJoinBtn = () =>{

        if (roomId.length || username.length === 0){
            return "name or room id is missing";
        }

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


    }

    if(IsJoined){
        useEffect(()=>{
            socket.on("initilization",(data:any)=>{
                const {userId,state} = data;
                setCurrentState(state.type)
            })


            socket.on("LEADERBOARD",(data:any)=>{
                setCurrentState("leaderboard")
                setLeaderboard(data.leaderboard)
            })

            socket.on("CHANGE_PROBLEM",(data:any)=>{
                setCurrentState("CHANGE_PROBLEM")
                setcurrentProblem(data.problem)
            })

        },[])


        if(currentState==="not_started"){
            return(<>
                        
            <h1>This quiz hasnt started yet</h1>
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