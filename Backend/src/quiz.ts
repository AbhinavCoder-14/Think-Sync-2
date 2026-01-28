import crypto from "crypto";
import { IoManager } from "./controllers/IoInit.js";

export interface User {
  name: string;
  id: any;
  points: number;
}

type AllowedSubmission = 0 | 1 | 2 | 3;
const TIME_DURATION_SEC = 20;
export interface Problem {
  problemId: string;
  title: string;
  image: string;
  answer: AllowedSubmission;
  startTime: number;
  option: {
    id: number;
    title: string;
  };
  submission: {
    problemId: string;
    userId: string;
    submitedAnswer: AllowedSubmission;
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

  constructor(roomId: string) {
    this.roomId = roomId;
    this.hasStarted = false;
    this.users = [];
    this.problems = [];
    this.activeProblem = 0;
    this.currentState = "NOT STARTED";
  }

  private randomUUId() {
    let userId = crypto.randomUUID();
    console.log(userId);
    return userId;
  }

  public addUser(name: string) {
    console.log("enterd in this quiz.ts")
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
    console.log("------------",this.users)
    return {userId,count:this.users.length,allUser:this.users};
  }


  public removeUser(userId:string){
    this.users = this.users.filter((user)=>user.id !==userId)
    this.user_count()
    console.log("removing user")

  }

  public start() {
    this.hasStarted = true;
    this.currentState = "CHANGE_PROBLEM";
    this.problems[this.activeProblem]?.startTime == new Date().getTime();
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
    const getLeaderboard = this.users
      .sort((a, b) => (a.points < b.points ? 1 : -1))
      .splice(0, 20);
    IoManager.getSocketInstance().io.to(this.roomId).emit("currentStateQuiz", {
      state: this.currentStateQuiz(),
      getLeaderboard,
    });
    return getLeaderboard;
  }

  public next() {
    console.log("Entered in next - quiz")

    const io = IoManager.getSocketInstance().io;
    this.activeProblem++;
    this.currentState = "CHANGE_PROBLEM";
    if (this.problems[this.activeProblem]) {
      io.to(this.roomId).emit("currentStateQuiz", {
        state: this.currentStateQuiz(),
        problem: this.problems[this.activeProblem],
      });
      console.log("Entered in next - quiz")


      setTimeout(() => this.sendLeaderBoard(), TIME_DURATION_SEC * 1000);
    } else {
      this.currentState = "QUIZ_ENDED";
      this.sendLeaderBoard();
    }
  }


  public addProblem(data:any){
    this.problems.push(data)

  }

  public submit(
    userId: string,
    problemId: string,
    submission: AllowedSubmission
  ) {
    const submissionTime = new Date().getTime();
    const isProblemExists = this.problems.find((x) => {
      x.problemId == problemId;
    });

    if (isProblemExists) {
      const isExistingSubmission = isProblemExists.submission.find((x) => {
        x.userId == userId;
      });

      if (isExistingSubmission) {
        return;
      }
      isProblemExists.submission.push({
        problemId,
        userId,
        submitedAnswer: submission,
        isCorrect: isProblemExists.answer == submission,
      });

      const user = this.users.find((x) => {
        x.id == userId;
      });
      if (user) {
        user.points +=
          1000 -
          ((submissionTime - isProblemExists.startTime) * 600) /
            (TIME_DURATION_SEC * 1000);
      }
    }
  }

  public user_count(){
    console.log("entered in user_count from backend")
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
      return { type: "CHANGE_PROBLEM", problem: problem };
    }

    if (this.currentState === "LEADERBOARD") {
      return { type: "LEADERBOARD", leaderboard: this.sendLeaderBoard() };
    }

    if (this.currentState === "QUIZ_ENDED") {
      return { type: "QUIZ_ENDED", leaderboard: this.sendLeaderBoard() };
    }
  }
}
