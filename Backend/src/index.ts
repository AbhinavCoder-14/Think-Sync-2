
import express from 'express';
import cors from "cors"
import http from 'http';
import crypto from 'crypto';

import { IoManager } from './controllers/IoInit.js';
import { UserManager } from './controllers/UserController.js';
import { Socket } from 'socket.io';



const app = express()
const port = process.env.PORT || 4000;


app.use(cors())
app.use(express.json())

const server:http.Server = http.createServer(app)

// Singleton instance is created for socket.io server
IoManager.getSocketInstance(server);
const userManager = new UserManager()


const io = IoManager.getSocketInstance().io
io.on("connection",(socket:Socket)=>{
      console.log("User is connected",socket.id)
      socket.on("message",(message)=>{
        message = socket.id+'-'+message.message;

        // this io emit use for broadcasting the message to all the users
        io.emit("message",{
          msg:message,
          timeStamp: new Date(),
        })
      })




      userManager.addAdminInit(socket)
      userManager.addUser(socket)


      socket.on("disconect",()=>{
        console.log("user disconected",socket.id)
      })
    })



















app.post("/api/get_instance",(req,res)=>{
    const message:String = req.body.message
    const io = IoManager.getSocketInstance().io
    console.log(io.engine.clientsCount)

    io.emit("admin-message",{

        msg:"Admin-"+message,
        timeStamp: new Date(),
    })

    res.json({status:"notification have been sent"})
})


app.post("/api/create_room",(req,res)=>{

    const {credentials} = req.body
    const io = IoManager.getSocketInstance().io
    let roomId  = crypto.randomUUID();
    console.log(roomId)


    res.json({"roomId":roomId})
})







server.listen(port,()=>{
    console.log(`Server is up and running on ${port}`)
});




