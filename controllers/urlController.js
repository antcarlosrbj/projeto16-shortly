import connection from "./db.js";
import joi from "joi";
import { nanoid } from 'nanoid/async'


export async function urlsShortenPOST(req, res) {
    try {
        
        const {userId} = res.locals;
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

        await connection.query('INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3)', [userId, data.url, shortUrl]);
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
            shortUrl: joi.string().min(8).max(8).required()
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

        await connection.query('UPDATE urls SET "visitCount" = $1 WHERE id = $2', [result.rows[0].visitCount+1, result.rows[0].id])
        
        /* REDIRECT */

        res.redirect(result.rows[0].url);


    } catch (error) {
        console.log(`urlsOpenShortUrlGET - ${error}`);
        res.sendStatus(500);
    }
}


export async function urlsIdDELETE(req, res) {
    try {
        
        const data = req.params;
        data.id = Number(data.id);

        
        /* VALIDATION (JOI) */

        const dataSchema = joi.object({
            id: joi.number().integer().min(1).required()
        });

        const validation = dataSchema.validate(data);

        if (validation.error) {
            console.log(`urlsIdDELETE/VALIDATION (JOI) - ${validation.error}`);
            res.status(404).send(validation.error);
            return;
        }
        
        
        /* SEARCH IN THE DATABASE */

        const result = await connection.query('SELECT * FROM urls WHERE id = $1 AND active = true', [data.id]);

        if(!result.rows[0]) {
            console.log(`urlsIdDELETE/SEARCH IN THE DATABASE`);
            res.sendStatus(404);
            return;
        }
        
        
        /* IS THIS USER? */

        if(result.rows[0].userId !== res.locals.userId) {
            console.log(`urlsIdDELETE/IS THIS USER?`);
            res.sendStatus(401);
            return;
        }
        
        
        /* DELETE IN THE DATABASE */

        await connection.query('UPDATE urls SET active = false WHERE id = $1', [data.id]);
        res.sendStatus(204);


    } catch (error) {
        console.log(`urlsIdDELETE - ${error}`);
        res.sendStatus(500);
    }
}


export async function usersIdGET(req, res) {
    try {
        
        const data = req.params;
        data.id = Number(data.id)

        
        /* VALIDATION (JOI) */

        const dataSchema = joi.object({
            id: joi.number().integer().min(1).required()
        });

        const validation = dataSchema.validate(data);

        if (validation.error) {
            console.log(`usersIdGET/VALIDATION (JOI) - ${validation.error}`);
            res.status(404).send(validation.error);
            return;
        }
        

        /* SEARCH IN THE DATABASE */

        const user = await connection.query('SELECT * FROM users WHERE id = $1', [data.id]);

        if(!user.rows[0]) {
            console.log(`usersIdGET/SEARCH IN THE DATABASE`);
            res.sendStatus(404);
            return;
        }

        const urls = await connection.query('SELECT * FROM urls WHERE "userId" = $1 AND active = true', [data.id]);


        /* IS THIS USER? */

        if(user.rows[0].id !== res.locals.userId) {
            console.log(`usersIdGET/IS THIS USER?`);
            res.sendStatus(401);
            return;
        }

        
        /* DATA SUBMISSION */

        let visitCount = 0;
        for (let i = 0; i < urls.rows.length; i++) {
            visitCount += urls.rows[i].visitCount;
            delete urls.rows[i].userId;
            delete urls.rows[i].createdAt;
            delete urls.rows[i].active;
        }

        const answer = {...user.rows[0]};
        delete answer.email;
        delete answer.password;
        delete answer.createdAt;
        answer.visitCount = visitCount;
        answer.shortenedUrls = urls.rows;


        res.send(answer);


    } catch (error) {
        console.log(`usersIdGET - ${error}`);
        res.sendStatus(500);
    }
}


export async function ranking(req, res) {
    try {

        /* SEARCH IN THE DATABASE */

        const result = await connection.query('SELECT users.id, users.name, count(urls.id) AS "linksCount", coalesce(sum(urls."visitCount"), 0) AS "visitCount" FROM users LEFT JOIN urls ON users.id = urls."userId" GROUP BY users.id ORDER BY "visitCount" DESC LIMIT 10');
        
        
        /* DATA SUBMISSION */

        res.send(result.rows);


    } catch (error) {
        console.log(`ranking - ${error}`);
        res.sendStatus(500);
    }
}