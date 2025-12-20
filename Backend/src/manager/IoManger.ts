import { Server } from "socket.io";
import http from "http";
import { stringify } from "querystring";
import type { Http2Server } from "http2";

export class IoManager {
  work: string;
  private static server?: Http2Server;
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

