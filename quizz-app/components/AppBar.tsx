"use client";
import { redirect, useRouter } from "next/navigation"

import { signIn,signOut,useSession } from "next-auth/react"
import Link from "next/navigation";



export const AppBar = () =>{
    const router = useRouter();
    const session = useSession();

    return(
        <div>
            <button  className="m-3 p-2 border-blue-900 border-2 cursor-pointer rounded-xl" onClick={()=>{

                if (!session) {
                    signIn();
                }
                else{
                    redirect("/admin/create")
                }
            }}>Organise a Quiz</button>

            <button className="m-3 p-2 border-blue-900 border-2 cursor-pointer rounded-xl" onClick={()=>{
            signOut(); 3
            }}>Logout</button>

            {JSON.stringify(session.data?.user)}
        </div>
    )
}