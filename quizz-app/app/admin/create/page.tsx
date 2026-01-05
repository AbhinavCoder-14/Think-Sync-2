
'use client'
import { Button } from "@/components/ui/button"
import { useSocket } from "@/app/context/SocketContext";
import { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface session{
    name: string;
    email: string;
    sub: string;
    id: string;
    role: string;
    iat: number;
    exp: number;
    jti: string;}

export default function Create() {
    const socket:any = useSocket()

    const { data: session } = useSession()
    
    const createRoom = () =>{
        let roomId  = crypto.randomUUID();
        if(session?.user.role === "admin"){
            console.log("user is autherize to create quiz room")
            const ADMIN_ROOM_KEY = "1234"
            if(socket){
                socket.emit("join_admin",{
                    password:ADMIN_ROOM_KEY,
                })
                socket.emit("create_quiz",{
                    roomId:roomId
                })
            }

        

        }

        // TODO: verify that the user is autherize or not to create room 
    } 


    return (
        <>
        
        <h1>Now you can create room with the clicking on btn</h1>
        <Button className="cursor-pointer" onClick={()=>{createRoom()}} size="lg">Create Room</Button>
        <h1>Right now i have hardcoded the quiz questions</h1>
        </>

        


    )

}



