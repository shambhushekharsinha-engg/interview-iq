import express from "express"
import isAuth from "../middlewares/isAuth.js" // Your existing auth middleware[cite: 4]
import { upload } from "../middlewares/multer.js" // Your existing upload middleware[cite: 4]
import { aiGenerateLimiter, aiSubmitLimiter } from "../middlewares/rateLimiter.js" // New rate limiters
import { 
    analyzeResume, 
    finishInterview, 
    generateQuestion, 
    getInterviewReport, 
    getMyInterviews, 
    submitAnswer 
} from "../controllers/interview.controller.js" // Your existing controllers[cite: 4]

const interviewRouter = express.Router()

// Resume Upload Route[cite: 4]
interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume) //[cite: 4]

// AI Processing Routes (Protected by Authentication AND Rate Limiting)
interviewRouter.post("/generate-questions", isAuth, aiGenerateLimiter, generateQuestion)
interviewRouter.post("/submit-answer", isAuth, aiSubmitLimiter, submitAnswer)

// Lifecycle & Analytics Routes[cite: 4]
interviewRouter.post("/finish", isAuth, finishInterview) //[cite: 4]
interviewRouter.get("/get-interview", isAuth, getMyInterviews) //[cite: 4]
interviewRouter.get("/report/:id", isAuth, getInterviewReport) //[cite: 4]

export default interviewRouter