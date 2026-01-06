import { AppBar } from "@/components/AppBar";
import Image from "next/image";

import PixelSnow from '../components/PixelSnow';

import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import NavBar from "@/components/navBar";


export default async function Home() {
  
  const session = await getServerSession(options);





    
  return (
    <>

    <div>

      <NavBar/>

      <h1>{JSON.stringify(session)}</h1>
        <AppBar/>
        <div style={{ width: '100%', height: '100vh', position: 'absolute', top:"0px",zIndex:"-100" }}>
      <PixelSnow 
        color="#ffffff"
        flakeSize={0.01}
        minFlakeSize={1.25}
        pixelResolution={200}
        speed={1.25}
        density={0.3}
        direction={125}
        brightness={1}
        />
      </div>



    </div>
    



    </>
  );
}
