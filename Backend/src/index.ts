import 'dotenv/config'; // Load environment variables first

import express from 'express';
import cors from "cors"
import http from 'http';
import crypto from 'crypto';

import { IoManager } from './controllers/IoInit.js';
import { UserManager } from './controllers/UserController.js';
import { Socket } from 'socket.io';
import { redis } from "./redis/client.js";



const app = express()
const port = process.env.PORT || 4000;
const instanceId = process.env.INSTANCE_ID || "backend-local";


const redis_test = async () => {
  await redis.set("value","hello")
  const value = await redis.get("value")
  console.log("redis saying, ",value)
}

redis_test()



// Validate required environment variables
if (!process.env.ADMIN_PASSWORD && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: ADMIN_PASSWORD not set. Using default value.');
}

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
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


app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/ready", async (_req, res) => {
  try {
    await redis.ping();
    res.json({ status: "ready", instanceId });
  } catch (error) {
    res.status(503).json({ status: "not-ready", instanceId });
  }
});

app.get("/metrics", (_req, res) => {
  res.type("text/plain");
  res.send([
    `quiz_backend_uptime_seconds ${Math.floor(process.uptime())}`,
    `quiz_backend_connected_sockets ${IoManager.getSocketInstance().io.engine.clientsCount}`,
    `quiz_backend_instance_info{instance_id="${instanceId}"} 1`,
  ].join("\n") + "\n");
});

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




