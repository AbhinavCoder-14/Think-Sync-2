
import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"


export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req:NextRequestWithAuth) {
    console.log(req.nextauth.token)
    console.log(req.nextUrl.pathname)

    if (req.nextUrl.pathname.startsWith("admin/create")&& (req.nextauth.token?.role !== "admin")){
        return NextResponse.rewrite(
            new URL("/denied",req.url)
        )
    } 
    if (req.nextUrl.pathname.startsWith("/admin/deshboard")&& (req.nextauth.token?.role !== "admin")){
        return NextResponse.rewrite(
            new URL("/denied",req.url)
        )
    }



  },
  {
    callbacks: {
      authorized: ({ token }) => token?.role === "admin",
    },
  },
)

export const config = { matcher: ["/admin/create","/admin/deshboard"] }



