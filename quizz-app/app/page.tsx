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

        <AppBar/>
        <div style={{ width: '100%', height: '100vh', position: 'absolute', top:"0px",zIndex:"-100" }}>
        <PixelSnow
    flakeSize={0.008}
    pixelResolution={250}
    speed={2.1}
    depthFade={11.5}
    farPlane={23}
    brightness={1.6}
    density={0.2}
    direction={140}
  />
      </div>



    </div>
    



    </>
  );
}
