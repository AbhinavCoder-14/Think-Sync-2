import { Socket } from "socket.io";
import { QuizManager } from "./Quizcontroller.js";

interface User {
  roomId: string;
  name: string;
  socket: Socket;
}

const ADMIN_ROOM_KEY = "1234";

export class UserManager {
  public users = new Map<string,{ roomId: string; userId: string }>(); // useless
  private isAdmin: boolean;

  private quizManager;

  constructor() {
    // this.users = []; // useless
    this.quizManager = new QuizManager();
    this.isAdmin = false;
  }

  addUser(socket: Socket) {
    this.UserOperations(socket);
  }

  public disconnectUser(socket:Socket){
    const user = this.users.get(socket.id)

    if (user){
      this.quizManager.removeUser(user.roomId,user.userId)
      this.users.delete(socket.id)
      console.log("removing user - UserControl")
    }

  }

  addAdminInit(socket: Socket) {
    socket.on("join_admin", (data) => {
      if (data.password !== ADMIN_ROOM_KEY) {
        return;
      }

      this.isAdmin = true;
      console.log("admin connection init");

    });
    
      socket.on("create_quiz", (data) => {
        if(!this.isAdmin){
          return "unautherized for this event access"
        }
        this.quizManager.addQuizbyAdmin(data.roomId);
        console.log("create quiz called ", data.roomId);
      });

      socket.on("add_problems", (data) => {
        if(!this.isAdmin){
          return "unautherized for this event access"
        }
        this.quizManager.addProblem(data.roomId, data.problem);
        console.log(`Admin Added in ${data.roomId} ---- ${data.problem}`)
      });

      socket.on("next", (data) => {
        if(!this.isAdmin){
          return "unautherized for this event access"
        }
        this.quizManager.next(data.roomId);
      });

  }

  private UserOperations(
    socket: Socket
  ) {
    socket.on("join", (data) => {
      console.log("enterd in usercontroller!!")
      const userId = this.quizManager.addUser(data.name, data.roomId);
      console.log("user id is -- ", userId?.userId)
      if (userId?.userId){
        socket.emit("initilization", {
          userId,
          state:this.quizManager.currentStateQuiz(data.roomId),
          count:userId.count
        });
        socket.join(data.roomId)
        this.users.set(socket.id,{roomId:data.roomId,userId:userId.userId})
      }
    });
    // socket.on("user_count",(data)=>{
    //   const user_count = this.quizManager.user_count(data.roomId)
    // })

    socket.on("disconnect",()=>{
      this.disconnectUser(socket)
    })

    socket.on("submit", (data) => {
      const userId = data.userId;
      const problemId = data.problemId;
      const submission = data.submission;
      const roomId = data.roomId;

      if (
        submission != 1 ||
        submission != 2 ||
        submission != 2 ||
        submission != 3
      ) {
        console.error("issue while sumiting the answer");
        return;
      }
      this.quizManager.submit(userId, roomId, problemId, submission);
    });

    // socket.on("join_admin",(data)=>{
    //   if (data.password!==ADMIN_ROOM_KEY){
    //     return;
    //   }
    //   console.log("admin connection init")

    //   socket.on("create_quiz",(data)=>{
    //     this.quizManager.addQuizbyAdmin(data.roomId)
    //     console.log("create quiz called ", data.roomId)
    //   })

    //   socket.on("add_problems",(data)=>{
    //     this.quizManager.addProblem(data.roomId,data.problem)
    //   })

    //   socket.on("next",(data)=>{
    //     this.quizManager.next(data.roomId)
    //   })
    // })
  }
}
