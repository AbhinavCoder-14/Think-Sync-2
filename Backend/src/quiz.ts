import crypto from "crypto"

interface User{
    name:string;
    id:any;
    point:number;   
}



export class Quiz{
    public roomId:string;
    private hasStarted:boolean;
    private users:User[];
    


    constructor(roomId:string){
        this.roomId = roomId
        this.hasStarted = false;
        this.users = [];
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

        return id
    }




    







}