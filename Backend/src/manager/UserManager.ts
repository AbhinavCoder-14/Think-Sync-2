import { stringify } from "node:querystring";
import { Socket } from "socket.io";
import { QuizManager } from "./Quizmanager.js";

interface User {
  roomId: string;
  name: string;
  socket: Socket;
}

export class UserManager {
  public users: User[];

  private quizManager;

  constructor() {
    this.users = [];
    this.quizManager = new QuizManager();
  }

  addUser(roomId: string, name: string, socket: Socket) {
    this.users.push({
      name,
      roomId,
      socket,
    });
    this.createHandlersForOtherUpdation(roomId, name, socket);
  }

  private createHandlersForOtherUpdation(
    roomId: string,
    name: string,
    socket: Socket
  ) {
    socket.on("join", (data) => {
      const userId = this.quizManager.addUser(data.name, data.roomId);
      socket.emit("userId",{
        userId
      })
    });
    socket.on("submit",(data)=>{
        const userId = data.userId
        const problemId = data.problemId
        const submission = data.submission

        if(submission !=1 ||submission !=2 ||submission !=2 ||submission !=3){
            console.error("issue while sumiting the answer")
            return;
        }
        this.quizManager.submit(roomId,problemId,submission)
    })
  }





}
