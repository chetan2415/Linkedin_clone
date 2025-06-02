import dotenv from 'dotenv'; 
dotenv.config();             

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from "./routes/UserRouter.js";
import postRoutes from "./routes/PostRouter.js";
import AIRouter from "./routes/AIRouter.js";
import jobs from './routes/Jobs.js'; 
import MessagesRouter from './routes/MessagesRouter.js';
import ResumeModel from './routes/ResumeRouter.js';
import chat from './routes/Chat.js'; 
import path from 'path';

const PORT = process.env.PORT || 9000;
const uri = process.env.MONGO_URL;

const app = express();
app.use(cors());
app.use(express.json());

app.use(userRouter);
app.use(postRoutes); 
app.use(AIRouter);
app.use(MessagesRouter);
app.use(ResumeModel);
app.use("/jobs",jobs);
app.use(chat);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


//console.log("MongoDB URI:", uri); 
mongoose.connect(uri)
    .then(() => {
        console.log("DB connected successfully!");
        app.listen(PORT, () => {
            console.log(`App started on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("DB connection failed:", err);
        process.exit(1);
    });
