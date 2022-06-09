import express from 'express';


import {verifyToken} from './../middlewares/authMiddleware.js'
import {urlsShortenPOST, urlsIdGET} from './../controllers/urlController.js';


const urlRouter = express.Router();

urlRouter.post("/urls/shorten", verifyToken, urlsShortenPOST);
urlRouter.get("/urls/:id", urlsIdGET);

export default urlRouter;