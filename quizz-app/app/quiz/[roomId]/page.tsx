// 'use client';

import { useSocket } from "@/app/context/SocketContext";

async function Quiz({ params }:{params:{roomId:string}}) {

    const socket:any = useSocket()
    


















    const { roomId } = await params
    return (
        <><h1>This is quiz room page - {roomId}</h1></>
    )
}








export default Quiz;
