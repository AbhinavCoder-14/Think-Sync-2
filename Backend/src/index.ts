
import express from 'express';
import cors from "cors"
import http from 'http';

import { IoManager } from './manager/IoManger.js';


const app = express()
const port = process.env.port || 4000;


app.use(cors())

const server:http.Server = http.createServer(app)

// Singleton instance is created for socket.io server
const io = IoManager.getSocketInstance(server);


















app.listen(port,()=>{
    console.log(`Server is up and running on ${port}`)
});


