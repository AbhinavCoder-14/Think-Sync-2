"use client";
import { redirect, useRouter } from "next/navigation"

import { signIn,signOut,useSession } from "next-auth/react"
import Link from "next/navigation";



export const AppBar = () =>{
    const router = useRouter();
    const session = useSession();

    return(
        <div className="flex flex-col justify-center align-middle m-auto h-[95vh] border-2 border-rose-50">
            <button  className="m-3 p-2 border-blue-900 border-2 cursor-pointer rounded-xl w-100" onClick={()=>{

                if (!session) {
                    signIn();
                }
                else{
                    redirect("/admin/create")
                }
            }}>Organise a Quiz</button>

            <button className="m-3 p-2 border-blue-900 border-2 cursor-pointer rounded-xl w-100 " onClick={()=>{
            signOut();
            }}>Logout</button>

            {JSON.stringify(session.data?.user)}
        </div>
    )
}