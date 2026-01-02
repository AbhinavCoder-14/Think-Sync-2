import { Quiz } from "../quiz.js"


export class QuizManager{
    private quizes:Quiz[];


    constructor(){
        this.quizes = []



    }

    public start(roomId:string){
        
    }


    public next(roomId:string){

    }


    public addUser(name:string,roomId:string){
        this.getQuiz(roomId)?.addUser(name)
    }


    public getQuiz(roomId:string){
        return this.quizes.find((x)=>{
            x.roomId === roomId
        }) ?? null
    }

// i think this will go to quiz.ts
//    public addQuizbyAdmin(roomId:string){
//         this.quizes.push({
//             roomId,false,
//         })
//     }



}