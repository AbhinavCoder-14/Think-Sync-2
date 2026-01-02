import crypto from "crypto"

interface User{
    name:string;
    id:any;
    point:number;   
}

interface Problem{

    problemId:string;
    title:string;
    image:string;
    answer:0|1|2|3;
    option:{
        id:number;
        title:string;
    }
};



export class Quiz{
    public roomId:string;
    private hasStarted:boolean;
    private users:User[];
    private problems:Problem[];
    


    constructor(roomId:string){
        this.roomId = roomId
        this.hasStarted = false;
        this.users = [];
        this.problems = [];
    }

    private randomUUId(){
        let userId  = crypto.randomUUID();
        console.log(userId)

    }

    public addUser(name:string){
        const id = this.randomUUId()
        this.users.push({
            name,id,point:0
        })

        return id;
    }

    public submit(roomId:string,probleId:string,submission: 0|1|2|3){

    }


}