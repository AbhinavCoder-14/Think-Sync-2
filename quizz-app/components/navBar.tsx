    "use client";

    import { signIn, useSession, signOut } from "next-auth/react";
    import { useEffect, useState } from "react";
    import { useRouter, redirect } from "next/navigation";
    import { Button } from "./ui/button";
    import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import { escape } from "querystring";

    export default function NavBar() {
        const [isLogin, setisLogin] = useState(false)
        const session = useSession();
        const {status} = useSession();
    useEffect(() => {
        if(session.data?.user){
            setisLogin(true)
        }
        else{

            setisLogin(false)
        }



    }, [session]);

    return (
        <>
        <div className="mt-5">
            <nav className="px-7 flex m-auto flex-row justify-between w-[70%] border-2 border-b-blue-950 rounded-3xl bg-[#130d1c]/5 backdrop-blur-sm">
            <div className="leftSide flex flex-row justify-center align-middle my-auto">
                <h1 className="logo text-xl font-medium">ThinkSync</h1>
            </div>

            <div className="rightSide flex flex-row">
                <ul className="flex flex-row ">
                <li className="m-2">
                    <Button className="bg-black text-amber-50 hover:bg-black font-medium  cursor-pointer">
                    Home
                    </Button>
                </li>
                <li className="m-2">
                    <Button
                    className="bg-black text-amber-50 font-medium  hover:bg-black cursor-pointer"
                    onClick={() => {
                        redirect("/UserJoin");
                    }}
                    >
                    Join Quiz
                    </Button>
                </li>
                <li className="m-2  cursor-pointer">
                    {(status==="loading") ? null:

                        !isLogin ? (
                    <Button
                        className=" cursor-pointer"
                        onClick={() => {
                        signIn();
                        }}
                    >
                        Login
                    </Button>
                    ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                        <Button
                            className="cursor-pointer"
                            onClick={() => {
                            return;
                            }}
                        >
                            Hey,{session.data?.user.name}
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                        <DropdownMenuItem onClick={() =>{
                            signOut()
                            setisLogin(false) 

                        } 
                        

                        }>
                            Logout
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    )
                    
                    
                    }
                </li>
                </ul>
            </div>
            </nav>
        </div>
        </>
    );
    }
