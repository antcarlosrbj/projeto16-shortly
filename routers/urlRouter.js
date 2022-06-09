import express from 'express';


import {verifyToken} from './../middlewares/authMiddleware.js'
import {urlsShortenPOST} from './../controllers/urlController.js';


const urlRouter = express.Router();

urlRouter.post("/urls/shorten", verifyToken, urlsShortenPOST);

export default urlRouter;