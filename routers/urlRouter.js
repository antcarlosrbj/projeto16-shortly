import express from 'express';


import {verifyToken} from './../middlewares/authMiddleware.js'
import {urlsShortenPOST, urlsIdGET, urlsOpenShortUrlGET, urlsIdDELETE, usersIdGET, ranking} from './../controllers/urlController.js';


const urlRouter = express.Router();

urlRouter.post("/urls/shorten", verifyToken, urlsShortenPOST);
urlRouter.get("/urls/:id", urlsIdGET);
urlRouter.get("/urls/open/:shortUrl", urlsOpenShortUrlGET);
urlRouter.delete("/urls/:id", verifyToken, urlsIdDELETE);
urlRouter.get("/users/:id", verifyToken, usersIdGET);
urlRouter.get("/ranking", ranking);

export default urlRouter;