import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"


async function Profile() {

    // useSession for client side pages
    const session = await getServerSession()
    

    if(!session){
        redirect('api/auth/signin?callbackUrl=/profile')
    }




    return(
        <><h1>this is the profile page {session?.user.email}</h1></>
    )
}




export default Profile;