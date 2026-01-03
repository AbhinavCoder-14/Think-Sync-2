import { Quiz } from "../quiz.js"
import { IoManager } from "./IoManger.js";


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
        io.to(roomId).emit({
            type:"Start_Room" 
        })



    }


    public addUser(name:string,roomId:string){
        this.getQuiz(roomId)?.addUser(name) // user will get added to the perticular roomId quiz
    }
    // This getQuiz will return the roomId array of quiz which is the different object of Quiz is created by the admin in addQuizbyAdmin
    public getQuiz(roomId:string){
        return this.quizes.find((x)=>{
            x.roomId === roomId
        }) ?? null 

        // return array of unique roomId quiz array
    }

    public submit(roomId:string,problemId:string,submission:0|1|2|3){
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

}