import { Quiz } from "../quiz.js";
import { redis } from "../redis/client.js";
import { IoManager } from "./IoInit.js";

type AllowedSubmission =  1 | 2 | 3 | 4;

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
  private quizMap: Map<string, Quiz>; // O(1) room lookup instead of O(n) array search
  private static readonly ACTIVE_ROOMS_SET_KEY = "rooms:active";

  constructor() {
    this.quizes = [];
    this.quizMap = new Map();
    
    // Rehydrate active rooms from Redis on server startup
    setTimeout(() => this.rehydrateActiveRooms(), 1000);
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

  public currentStateQuiz(roomId: string) {
    const quiz = this.getQuiz(roomId);
    if (quiz) {
      return quiz.currentStateQuiz();
    }
    return null;
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
    // O(1) lookup using Map instead of O(n) array.find()
    return this.quizMap.get(roomId) ?? null;
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
    this.quizMap.set(roomId, quiz); // ✅ Add to map for O(1) lookup
    console.log(`✓ Rehydrated room from Redis: ${roomId}`);
    return quiz;
  }

  public  submit(
    userId: string,
    roomId: string,
    problemId: string,
    submission: Number,
  ) {
    console.log("enterd in quiz submit")
    this.getQuiz(roomId)?.submit(userId, problemId, submission);

  }   

  // Rehydrate all active rooms from Redis on server startup
  private async rehydrateActiveRooms() {
    try {
      const roomIds = await redis.smembers(QuizManager.ACTIVE_ROOMS_SET_KEY);
      let rehydratedCount = 0;

      for (const roomId of roomIds) {
        if (!roomId) continue;
        if (this.quizMap.has(roomId)) continue;
        
        const state = await this.getQuizInRedis(roomId);
        if (state) {
          await this.loadQuizInMemory(roomId);
          rehydratedCount++;
        } else {
          // Room key expired but stale id remained in the set.
          await redis.srem(QuizManager.ACTIVE_ROOMS_SET_KEY, roomId);
        }
      }
      
      if (rehydratedCount > 0) {
        console.log(`Server startup: Rehydrated ${rehydratedCount} active room(s) from Redis`);
      }
    } catch (error) {
      console.error(' Error rehydrating rooms from Redis:', error);
    }
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
    this.quizMap.set(roomId, quiz); // ✅ Add to map for O(1) lookup
    
    console.log("✓ Quiz created:", roomId);
    
    // Persist to Redis with 4-hour TTL (quiz max duration)
    try {
      await redis.hset(`room:${roomId}`, {
        status: "waiting",
        currentQuestion: "0",
        createdAt: new Date().toISOString(),
      });
      await redis.sadd(QuizManager.ACTIVE_ROOMS_SET_KEY, roomId);
      // Set TTL to 4 hours (14400 seconds)
      await redis.expire(`room:${roomId}`, 14400);
      console.log(`✓ Room persisted to Redis with 4-hour TTL: ${roomId}`);
    } catch (error) {
      console.error(`❌ Failed to persist room to Redis: ${roomId}`, error);
    }
  }

  public user_count_admin(roomId: string) {
    const quiz = this.getQuiz(roomId);
    if (!quiz) {
      return null;
    }
    return quiz.user_count();
  }

public addProblem(roomId: string, problem: any) {
  console.log("Attempting to add problem to room:", roomId);
  const quiz = this.getQuiz(roomId);
  
  if (!quiz) {
    console.error("Quiz not found");
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
