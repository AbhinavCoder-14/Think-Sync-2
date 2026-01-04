
'use client'
import { Button } from "@/components/ui/button"

import { io } from 'socket.io-client';



export default function Create() {

    const createRoom = () =>{
        let roomId  = crypto.randomUUID();
        // TODO: verify that the user is autherize or not to create room 

    } 


    return (
        <>
        
        <h1>Now you can create room with the clicking on btn</h1>
        <Button className="cursor-pointer" onClick={()=>{createRoom}} size="lg">Create Room</Button>
        <h1>Right now i have hardcoded the quiz questions</h1>
        </>

        


    )

}



