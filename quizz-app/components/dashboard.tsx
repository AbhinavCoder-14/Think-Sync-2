
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { useSocket } from "@/app/context/SocketContext"


export const Dashboard = ({roomId,count1}:{roomId:string,count1:Number}) =>{
    const socket:any = useSocket()
    const [liveCount,setLiveCount] = useState(0)


    useEffect(() => {
        


        
        
        
    },[socket])

    const handleStart = () =>{
        socket.emit("next",{
            roomId:roomId
        })
    }


    return(<>
    
    <h1>Total user - {count1.toString()}</h1>

    <Button className="cursor-pointer m-2" onClick={handleStart}>
                    Start Quiz
                </Button>
    
    
    </>)



}



