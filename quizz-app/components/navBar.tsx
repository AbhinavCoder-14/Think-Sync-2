"use client"


import {signIn, useSession} from "next-auth/react"
import { useEffect } from "react"
import { useRouter,redirect } from "next/navigation"
import { Button } from "./ui/button"



export default function NavBar() {
    
    const session = useSession()
    
    // useEffect(()=>{

    // })

        return(<>
            <div className="mt-3">
                <nav className="px-7 flex m-auto flex-row justify-between w-[70%] border-2 border-b-blue-950 rounded-3xl">
                    <div className="leftSide flex flex-row justify-center align-middle my-auto">
                        <h1 className="logo text-xl">Logo</h1>
                    </div>
            
            
                    <div className="rightSide flex flex-row">
                        <ul className="flex flex-row ">
                            <li className="m-2"><Button className="bg-black text-amber-50 hover:bg-black font-medium  cursor-pointer">Home</Button></li>
                            <li className="m-2"><Button className="bg-black text-amber-50 font-medium  hover:bg-black cursor-pointer" onClick={()=>{
                                redirect("/UserJoin")
                            }}>Join Quiz</Button></li>
                            <li className="m-2  cursor-pointer">
                                {(!session) ? <Button className=" cursor-pointer" onClick={
                                    ()=>{
                                        signIn();
                                    }
                                }>Login</Button>:<Button className=" cursor-pointer" onClick={()=>{
                                    return;
                                }}>Hey,{session.data?.user.name}</Button>}
                            </li>
                        </ul>
            
                    </div>
            
                </nav>
            </div>
        </>)
    }
