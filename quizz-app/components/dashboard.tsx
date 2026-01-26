
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { useSocket } from "@/app/context/SocketContext"


export const Deshboard = ({roomId}:{roomId:string}) =>{
    const socket:any = useSocket()
    const [liveCount,setLiveCount] = useState(0)


    useEffect(() => {
        if(!socket){
            console.log("Entered in handle join useeffet but socket is null")
            return;
        }
        // socket.on("user_count", (data:any) => {
        //     console.log("Broadcast received:", data.count);
        //     setUserCount(data.count);
        // });
        // for starting the quiz

        socket.on("user_count",(data:any)=>{
            if (data.count){
                setLiveCount(data.count)
            }

        })


        
        
        
    },[socket])

    const handleStart = () =>{
        socket.emit("next",{
            roomId:roomId
        })
    }


    return(<>
    
    <h1>Total user - {liveCount}</h1>

    <Button className="cursor-pointer m-2" onClick={handleStart}>
                    Start Quiz
                </Button>
    
    
    </>)



}



