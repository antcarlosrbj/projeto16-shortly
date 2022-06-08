import express from 'express';


import { signupPOST, signinPOST } from './../controllers/authController.js';


const authRouter = express.Router();

authRouter.post("/signup", signupPOST);
authRouter.post("/signin", signinPOST);

export default authRouter;