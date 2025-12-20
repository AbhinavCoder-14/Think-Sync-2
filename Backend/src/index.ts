
import express from 'express';
import cors from "cors"
import http from 'http';

import { IoManager } from './manager/IoManger.js';


const app = express()
const port = process.env.port || 4000;


app.use(cors())


const io = IoManager.getSocketInstance()


const server = http.createServer(app)











app.listen(port,()=>{
    console.log(`Server is up and running on ${port}`)
});


