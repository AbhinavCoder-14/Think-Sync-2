

import { withAuth, NextRequestWithAuth } from "next-auth/middleware"


export default withAuth(
    function proxy (request:NextRequestWithAuth){
        console.log(request.nextUrl.pathname)
        console.log(request.nextauth.token)
    },
    {
        callbacks:{
            authorized:({ token }) =>{
                token?.role === "admin"
            }
        }
    }
)