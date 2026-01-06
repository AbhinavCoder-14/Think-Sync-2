"use client";
import { redirect, useRouter } from "next/navigation"

import { signIn,signOut,useSession } from "next-auth/react"
import Link from "next/navigation";
import { Button } from "./ui/button";





export const AppBar = () =>{
    const router = useRouter();
    const session = useSession();

    return(
        <div className="flex flex-col">





            <div className="flex flex-col justify-center align-middle m-auto h-[100vh]  w-[50%]">

                <div className="font-bold text-4xl text-center">

                    <h1>The fastest way to test your brain and sync up!</h1>
                </div>

                <div className="flex justify-center align-middle my-10">

                    <Button  className="m-3 p-2 cursor-pointer rounded-4xl w-45 font-normal" onClick={()=>{

                        if (!session) {
                            signIn();
                        }
                        else{
                            redirect("/admin/create")
                        }
                    }}>Organise a Quiz</Button>

                    <Button className="m-3 p-2 border-2 cursor-pointer rounded-4xl w-45  font-normal" onClick={()=>{

                        redirect("/UserJoin")
                    }}>Join Quiz</Button>

                    {/* {JSON.stringify(session.data?.user)} */}

                </div>

            </div>

        </div>
    )
}