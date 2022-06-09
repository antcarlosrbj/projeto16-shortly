import express from 'express';


import {verifyToken} from './../middlewares/authMiddleware.js'
import {urlsShortenPOST, urlsIdGET, urlsOpenShortUrlGET, urlsIdDELETE} from './../controllers/urlController.js';


const urlRouter = express.Router();

urlRouter.post("/urls/shorten", verifyToken, urlsShortenPOST);
urlRouter.get("/urls/:id", urlsIdGET);
urlRouter.get("/urls/open/:shortUrl", urlsOpenShortUrlGET);
urlRouter.delete("/urls/:id", verifyToken, urlsIdDELETE);

export default urlRouter;