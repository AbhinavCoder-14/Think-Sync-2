import { Quiz } from "../quiz.js"
import { IoManager } from "./IoManger.js";


type AllowedSubmission = 0| 1 |2 |3;


export interface Problem {
  problemId: string;
  title: string;
  image: string;
  answer: AllowedSubmission;
  option: {
    id: number;
    title: string;
  };
}


let globalProblemIndex = 0


export class QuizManager{
    private quizes:Quiz[];


    constructor(){
        this.quizes = []

    }

    public start(roomId:string){
        const quiz = this.getQuiz(roomId)

        if(!quiz){
            return
        }
        quiz.start();
    }


    public next(roomId:string){
        const io = IoManager.getSocketInstance().io
        const quiz = this.getQuiz(roomId)

        if(quiz){
            quiz.next()
        }
    }

    public currentStateQuiz(roomId:string){
        const quiz = this.getQuiz(roomId);
        if(quiz){
            return quiz.currentStateQuiz();
        }

    }


    public addUser(name:string,roomId:string){
        if(this.getQuiz(roomId)===null){
            return "Room Id is not found"
        }
        this.getQuiz(roomId)?.addUser(name) // user will get added to the perticular roomId quiz
    }
    // This getQuiz will return the roomId array of quiz which is the different object of Quiz is created by the admin in addQuizbyAdmin
    public getQuiz(roomId:string){
        return this.quizes.find((x)=>{
            x.roomId === roomId
        }) ?? null

        // return array of unique roomId quiz array
    }

    public submit(userId:string,roomId:string,problemId:string,submission:AllowedSubmission){
        this.getQuiz(roomId)?.submit(roomId,problemId,submission)

    }

    // i think this will go to quiz.ts
   public addQuizbyAdmin(roomId:string){
        if (this.getQuiz(roomId)){
            return;
        }
        const quiz = new Quiz(roomId)
        this.quizes.push(quiz)
    }


    public addProblem(roomId:string,problem:Problem){
        const quiz = this.getQuiz(roomId)
        if(!quiz){
            return null;
        }

        quiz.addProblem({
            ...problem,
            id:(globalProblemIndex++).toString(),
            startTime:null,
            submission:[]
        })


    }

}