import { Socket } from "socket.io";
import { QuizManager } from "./Quizcontroller.js";
import { redis } from "../redis/client.js";


interface User {
  roomId: string;
  name: string;
  socket: Socket;
}

// Load admin password from environment variables (default to "1234" for development)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";

// Log warning if using default password in production
if (process.env.NODE_ENV === 'production' && process.env.ADMIN_PASSWORD === undefined) {
  console.warn('SECURITY WARNING: Using default admin password "1234". Set ADMIN_PASSWORD env var for production.');
}

export class UserManager {
  public users = new Map<string,{ roomId: string; userId: string }>(); 
  private adminSockets: Set<string>;

  private quizManager;

  constructor() { 
    // this.users = []; // useless
    this.quizManager = new QuizManager();
    this.adminSockets = new Set();
  }

  addUser(socket: Socket) {
    this.UserOperations(socket);
  }

  public async getRoomRoute(roomId: string) {
    return this.quizManager.getRoomRoute(roomId);
  }

  public async allocateRoomRoute(roomId: string) {
    return this.quizManager.allocateRoomRoute(roomId);
  }

  public getActiveRoomCount() {
    return this.quizManager.getActiveRoomCount();
  }

  public getTotalUsersCount() {
    return this.quizManager.getTotalUsersCount();
  }

  public disconnectUser(socket:Socket){
    const user = this.users.get(socket.id)

    if (user){
      this.quizManager.removeUser(user.roomId,user.userId)
      this.users.delete(socket.id)
      console.log("removing user - UserControl")
    }

    this.adminSockets.delete(socket.id);
  }

  addAdminInit(socket: Socket) {
    socket.on("join_admin", (data) => {
      // Validate admin password against environment variable
      if (data.password !== ADMIN_PASSWORD) {
        socket.emit("auth_failed", { error: "Invalid admin password" });
        console.warn(" Failed admin login attempt from socket:", socket.id);
        return;
      }

      this.adminSockets.add(socket.id);
      socket.emit("admin_auth_ok", { status: "ok" });
      console.log("✓ Admin authenticated successfully");
      // const userslength = this.quizManager.

      // socket.emit("user_count",{

      // })

    });
    
      socket.on("create_quiz", async (data) => {
        if(!this.adminSockets.has(socket.id)){
          return "unautherized for this event access"
        }
        await this.quizManager.addQuizbyAdmin(data.roomId);
        const route = await this.quizManager.getRoomRoute(data.roomId);
        console.log("quiz created======")
        socket.emit("user_count_admin",{
          count : this.quizManager.user_count_admin(data.roomId)
        })
        socket.emit("room_assigned", {
          roomId: data.roomId,
          ...route,
        });
        console.log("create quiz called ", data.roomId);
      });

      socket.on("add_problems", (data) => {
        if(!this.adminSockets.has(socket.id)){
          return "unautherized for this event access"
        }
        this.quizManager.addProblem(data.roomId, data.problem);
        console.log(`Admin Added in ${data.roomId}`)
      });

      socket.on("next", (data) => {
        if(!this.adminSockets.has(socket.id)){
          return "unautherized for this event access"
        }
        this.quizManager.next(data.roomId);
        console.log("enterd in next from admin backend")
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
          userId:userId.userId,
          state:this.quizManager.currentStateQuiz(data.roomId),
          count:userId.count,
          allUser:userId.allUser
        });
        socket.join(data.roomId)
        this.users.set(socket.id,{roomId:data.roomId,userId:userId.userId})
        // wrong way because it just sending it to on user socket just have 1 to 1 connection
        // socket.emit("currentStateQuiz", { 
        //   state:this.quizManager.currentStateQuiz(data.roomId)
        // })

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
      const submission = Number(data.submission);
      const roomId = data.roomId;

      // if (
      //   submission != "1" ||
      //   submission != "2" ||
      //   submission !="3"||
      //   submission != "4"
      // ) {
      //   console.error("issue while sumiting the answer");
      //   console.log(data)
      //   return;
      // }
      console.log("submission is -- ", data)
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
