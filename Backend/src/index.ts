
import express from 'express';
import cors from "cors"


const app = express()
const port = process.env.port || 4000;

app.use(cors())













app.listen(port,()=>{
    console.log(`Server is up and running on ${port}`)
})


