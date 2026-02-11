import crypto from "crypto";
import { IoManager } from "./controllers/IoInit.js";
import {redis} from "./redis/client.js"


export interface User {
  name: string;
  id: any;
  points: number;
}

type AllowedSubmission = 1 | 2 | 3 | 4;
const TIME_DURATION_SEC = 20;
export interface Problem {
  problemId: string;
  title: string;
  image: string;
  answer: number;
  startTime: number;
  options: {
    id: number;
    title: string;
  }[];
  submission: {
    problemId: string;
    userId: string | any;
    submitedAnswer: Number | any;
    isCorrect: boolean;
  }[];
}

type currentState =
  | "NOT STARTED"
  | "STARTED"
  | "CHANGE_PROBLEM"
  | "LEADERBOARD"
  | "QUIZ_ENDED";

export class Quiz {
  public roomId: string;
  private hasStarted: boolean;
  private users: User[];
  private problems: Problem[];
  private activeProblem: number;
  private currentState: currentState;
  private currentQuestion: number;
  private status: string | undefined;


  constructor(roomId: string) {
    this.roomId = roomId;
    this.hasStarted = false;
    this.users = [];
    this.problems = [];
    this.activeProblem = 0;
    this.currentState = "NOT STARTED";
    this.currentQuestion = 0;
    this.status = "waiting";
  }

  private randomUUId() {
    let userId = crypto.randomUUID();
    // console.log(userId);
    return userId;
  }

  public addUser(name: string) {
    // console.log("enterd in this quiz.ts")
    const userId = this.randomUUId();
    this.users.push({
      name,
      id:userId,
      points: 0,
    });
    // wrong way it will not consider the disconnection of user and can't decrement the user count
    // const user_count = this.user_count()
    // console.log(user_count)

    // return {userId,user_count};

    this.user_count()
    // console.log("------------",this.users)
    return {userId,count:this.users.length,allUser:this.users};
  }


  public removeUser(userId:string){
    this.users = this.users.filter((user)=>user.id !==userId)
    this.user_count()
    // console.log("removing user")

  }

  public start() {
    this.hasStarted = true;
    this.currentState = "CHANGE_PROBLEM";
    const currentTimeMillis = Date.now()
    // console.log("yoo",Date.now())
    const problem = this.problems[this.activeProblem]
    if (!problem) return;

    problem.startTime = currentTimeMillis

    const io = IoManager.getSocketInstance().io;
    if(this.problems[this.activeProblem]){
      io.to(this.roomId).emit("currentStateQuiz", {
        state: this.currentStateQuiz(),
        problems: this.problems[this.activeProblem],
      });
    }

    setTimeout(() => {
      this.sendLeaderBoard();
    }, TIME_DURATION_SEC * 1000);
  }

  public sendLeaderBoard() {
    this.currentState = "LEADERBOARD";
    const getLeaderboard = [...this.users]
      .sort((a, b) => ((a.points < b.points) ? 1 : -1))
      .splice(0, 20);
    IoManager.getSocketInstance().io.to(this.roomId).emit("currentStateQuiz", {
      state: this.currentStateQuiz(),
      getLeaderboard,
    });
    setTimeout(() => {
      this.next();
    }, 2000);
    return getLeaderboard;
  }

  public next() {
    // console.log("Entered in next - quiz")

    const io = IoManager.getSocketInstance().io;
    this.currentState = "CHANGE_PROBLEM";
    this.activeProblem++;
    const currentTimeMillis = Date.now()
    // console.log("yoo",Date.now())
    const problem = this.problems[this.activeProblem-1]
    if (!problem) return;

    problem.startTime = currentTimeMillis

    // console.log("hello baby",problem.startTime)
    console.log(this.problems)
    if (this.problems[this.activeProblem-1]) {
      io.to(this.roomId).emit("currentStateQuiz", {
        state: this.currentStateQuiz(),
        problem: this.problems[this.activeProblem-1],
      });
      // console.log("Entered in next - quiz")
            
      setTimeout(() => this.sendLeaderBoard(), TIME_DURATION_SEC * 1000);
    } else {
      this.currentState = "QUIZ_ENDED";
      this.sendLeaderBoard();
    }
  }


  public addProblem(data:any){
    this.problems.push({...data,submission:[{problemId:"",userId:"",submitAnser:0,isCorrect:false}]
    ,startTime:0})
    // console.log("\n\n\nlksadjflkasjdflkjlasjdfkljsalkdf lkshadfkjhasldjkf\n\n\n",this.problems)
    return "problem added"

  }

  public submit(
    userId: string,
    problemId: string,
    submission: Number
  ) {
    const submissionTime = Date.now();
    // console.log("all problems",problemId)
    
    const isProblemExists = this.problems.find((x) => {
      return x.problemId.toString() === problemId.toString();
    });
    
    if (isProblemExists) {
      // const isProblemExists.submission
      const isExistingSubmission = isProblemExists.submission.find((x) => {
        return x.userId == userId;
      });
      
      if (isExistingSubmission) {
        console.log("user already submitted the answer")
        return;
      }
      isProblemExists.submission.push({
        problemId:problemId,
        userId:userId,
        submitedAnswer: submission,
        isCorrect: Number(isProblemExists.answer) === submission,
      });
      
      console.log("enterd in quiz--------- submit",isProblemExists)
      console.log("enterd in quiz users - ",this.users)

      
      if(isProblemExists.submission.find((x)=>x.userId===userId)?.isCorrect){
        console.log("correct answer by user id -- ", userId)
        const user = this.users.find((x) => {
          return x.id == userId;
        });

        if (user) {
          user.points += Number(1000 - ((submissionTime - isProblemExists.startTime) * 600) /(TIME_DURATION_SEC * 1000));
          console.log("user init",user)
        }
        else{
          console.log("user doesn't exist")
        }
        
        // an formula for rewarding points based on the the time they take to submit the answer
      } 
    }
  }

  public user_count(){
    // console.log("entered in user_count from backend")
    const io = IoManager.getSocketInstance().io;
    io.to(this.roomId).emit("user_count",{ // Broadcasting the message to everyone
      count:this.users.length,
      allUsers:this.users
    })
    

    // console.log("architectural way-- ",io.sockets.adapter.rooms.get(this.roomId)?.size)
    return this.users.length
  }

  public currentStateQuiz() {
    if (this.currentState === "NOT STARTED") {
      return {
        type: "NOT STARTED",
      };
    }

    if (this.currentState === "CHANGE_PROBLEM") {
      const problem = this.problems[this.activeProblem];
      return { type: "CHANGE_PROBLEM"};
    }

    if (this.currentState === "LEADERBOARD") {
      return { type: "LEADERBOARD"};
    }

    if (this.currentState === "QUIZ_ENDED") {
      return { type: "QUIZ_ENDED"};
    }
  }


  public setCurrentQuestion(questionNumber: number) {
    this.currentQuestion = questionNumber;
  }
  
  public setStatus(status: any) {
    this.status = status;
  }
}
