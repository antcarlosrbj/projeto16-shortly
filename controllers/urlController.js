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


export async function urlsIdGET(req, res) {
    try {
        
        const data = req.params;
        data.id = Number(data.id)

        
        /* VALIDATION (JOI) */

        const dataSchema = joi.object({
            id: joi.number().integer().min(1).required()
        });

        const validation = dataSchema.validate(data);

        if (validation.error) {
            console.log(`urlsIdGET/VALIDATION (JOI) - ${validation.error}`);
            res.status(404).send(validation.error);
            return;
        }
        

        /* SEARCH IN THE DATABASE */

        const result = await connection.query('SELECT * FROM urls WHERE id = $1 AND active = true', [data.id]);

        if(!result.rows[0]) {
            console.log(`urlsIdGET/SEARCH IN THE DATABASE`);
            res.sendStatus(404);
            return;
        }

        
        /* DATA SUBMISSION */

        res.send({
            id: result.rows[0].id,
            shortUrl: result.rows[0].shortUrl,
            url: result.rows[0].url
        });


    } catch (error) {
        console.log(`urlsIdGET - ${error}`);
        res.sendStatus(500);
    }
}


export async function urlsOpenShortUrlGET(req, res) {
    try {
        
        const data = req.params;

        
        /* VALIDATION (JOI) */

        const dataSchema = joi.object({
            shortUrl: joi.string().alphanum().min(8).max(8).required()
        });

        const validation = dataSchema.validate(data);

        if (validation.error) {
            console.log(`urlsOpenShortUrlGET/VALIDATION (JOI) - ${validation.error}`);
            res.status(404).send(validation.error);
            return;
        }
        
        
        /* SEARCH IN THE DATABASE */

        const result = await connection.query('SELECT * FROM urls WHERE "shortUrl" = $1 AND active = true', [data.shortUrl]);

        if(!result.rows[0]) {
            console.log(`urlsOpenShortUrlGET/SEARCH IN THE DATABASE`);
            res.sendStatus(404);
            return;
        }

        
        /* REDIRECT */

        res.redirect(result.rows[0].url);


    } catch (error) {
        console.log(`urlsOpenShortUrlGET - ${error}`);
        res.sendStatus(500);
    }
}