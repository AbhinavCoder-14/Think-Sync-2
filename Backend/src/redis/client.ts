import {Redis} from "ioredis";

import dotenv from "dotenv"

export const redis = new Redis({
    host: "localhost", 
    port: 6379,
  });

redis.on("connect",()=>{
    console.log("Redish connected with port ",6379)
})


redis.on("error",(err)=>{
    console.log("error occurs",err)
})