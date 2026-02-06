import { Quiz } from "../quiz.js";
import { redis } from "../redis/client.js";
import { IoManager } from "./IoInit.js";

type AllowedSubmission = 0 | 1 | 2 | 3;

export interface Problem {
  title: string;
  image: string;
  answer: AllowedSubmission;
  option: {
    id: number;
    title: string;
  };
}

let globalProblemIndex = 0;

export class QuizManager {
  private quizes: Quiz[];

  constructor() {
    this.quizes = [];
  }

  public start(roomId: string) {
    const quiz = this.getQuiz(roomId);

    if (!quiz) {
      return;
    }
    quiz.start();
  }

  public next(roomId: string) {
    const quiz = this.getQuiz(roomId);

    if (!quiz) {
      return "quiz not found";
    }
    quiz.next();
    console.log("Entered in next - quiz");
  }

  public async currentStateQuiz(roomId: string) {
    const quiz = this.getQuiz(roomId);
    const exists = await this.getQuizInRedis(roomId);
    if (quiz) {
      return quiz.currentStateQuiz();
    }
  }

  // public user_count(roomId:string){
  //     const quiz
  // }

  public addUser(name: string, roomId: string) {
    if (!this.getQuiz(roomId)) {
      return null;
    }
    console.log("enterd in add User");
    return this.getQuiz(roomId)?.addUser(name); // user will get added to the perticular roomId quiz
  }
  // This getQuiz will return the roomId array of quiz which is the different object of Quiz is created by the admin in addQuizbyAdmin

  public removeUser(roomId: string, userId: string) {
    if (!this.getQuiz(roomId)) {
      return null;
    }
    console.log("removing user");
    this.getQuiz(roomId)?.removeUser(userId);
  }

  public getQuiz(roomId: string) {
    return (
      this.quizes.find((x) => {
        return x.roomId === roomId;
      }) ?? null
    );

    // return array of unique roomId quiz array
  }
  // for persisting the data in RAM
  public async getQuizInRedis(roomId: string) {
    const data = await redis.hgetall(`room:${roomId}`);
    if (!data) {
      return null;
    }
    return {
      status: data?.status,
      currentQuestion: Number(data.currentQuestion),
    };
  }

  // Rehydration of quiz from redis
  private async loadQuizInMemory(roomId: string) {
    const state = await this.getQuizInRedis(roomId);
    if (!state) return null;

    const quiz = new Quiz(roomId);

    quiz.setCurrentQuestion(state.currentQuestion);
    quiz.setStatus(state.status);

    this.quizes.push(quiz);
    return quiz;
  }

  public submit(
    userId: string,
    roomId: string,
    problemId: string,
    submission: AllowedSubmission,
  ) {
    this.getQuiz(roomId)?.submit(userId, problemId, submission);
  }

  // i think this will go to quiz.ts
  public async addQuizbyAdmin(roomId: string) {
    if (this.getQuiz(roomId)) {
      return ("Room already exists");
    }
    // fix: problemmatic as it is casue problem i creating quiz and due to that addProblem is not working
    // if (!this.getQuiz(roomId) && (await this.getQuizInRedis(roomId))) {
    //   await this.loadQuizInMemory(roomId);
    //   return ("Room Already exists (rehydration success)");
    // }

    const quiz = new Quiz(roomId);
    this.quizes.push(quiz);
    console.log("quiz created")
    await redis.hset(`room:${roomId}`, {
      status: "waiting",
      currentQuestion: "0",
    });
  }

  public user_count_admin(roomId: string) {
    const quiz = this.getQuiz(roomId);
    if (!quiz) {
      return null;
    }
    return quiz.user_count();
  }

public addProblem(roomId: string, problem: any) {
  console.log("🔍 Attempting to add problem to room:", roomId);
  const quiz = this.getQuiz(roomId);
  
  if (!quiz) {
    console.error("❌ Quiz not found");
    return "quiz not found";
  }
  
  // ✅ Handle both string and object formats
  let parsedProblem = problem;
  if (typeof problem === 'string') {
    parsedProblem = JSON.parse(problem);
  }
  
  // ✅ Handle both single problem and array
  const problemsToAdd = Array.isArray(parsedProblem) 
    ? parsedProblem 
    : [parsedProblem]; // converting if the problems are not in array
    
  
  problemsToAdd.forEach((prob) => {
    quiz.addProblem({...prob, problemId: (globalProblemIndex++).toString()});
  });

  console.log("problems are added")
}
  // i'don't think user_count found is need to get the user count in perticular room
  // public user_count(roomId:string){
  //     const quiz = this.getQuiz(roomId)

  //     const user_count = quiz?.user_count()

  //     return user_count;

  // }
}
