import { Server } from "socket.io";
import http from "http";

import type { Http2Server } from "http2";

export class IoManager {
  work: string;
  private static server?: http.Server;
  private static _io: Server;
  public static instance: IoManager;

  private constructor(server: http.Server) {
    this.work = "This is the class for singlton instance creation";

    IoManager._io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    IoManager._io.on("connection",(socket)=>{
      console.log("User is connected",socket.id)
      socket.on("message",(message)=>{
        message = socket.id+'-'+message;
        IoManager._io.emit("message",{
          msg:message,
          timeStamp: new Date(),
        })
      })


      socket.on("disconect",()=>{
        console.log("user disconected",socket.id)
      })
    })
  }

  public static getSocketInstance(server?: http.Server): IoManager {
    if (!this.instance) {
      if (!server) {
        throw new Error("server is not formed");
      }
      this.instance = new IoManager(server);
    }
    return this.instance;
  }

  public get io() {
    return IoManager._io;
  }
}




