import connection from "./db.js";
import joi from "joi";
import { nanoid } from 'nanoid/async'


export async function urlsShortenPOST(req, res) {
    try {
        
        const {id} = res.locals;
        const data = req.body;

        
        /* VALIDATION (JOI) */

        const dataSchema = joi.object({
            url: joi.string().pattern(new RegExp('^https?:\/\/')).required()
        });

        const validation = dataSchema.validate(data);

        if (validation.error) {
            console.log(`urlsShortenPOST/VALIDATION (JOI) - ${validation.error}`);
            res.status(422).send(validation.error);
            return;
        }


        /* ADD TO DATABASE */

        const shortUrl = await nanoid(8);

        await connection.query('INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3)', [id, data.url, shortUrl]);
        res.status(201).send({
            shortUrl: shortUrl
        });
        

    } catch (error) {
        console.log(`urlsShortenPOST - ${error}`);
        res.sendStatus(500);
    }
}