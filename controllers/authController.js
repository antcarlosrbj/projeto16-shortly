import connection from "./db.js";
import joi from "joi";
import bcrypt from 'bcrypt';

export async function signupPOST(req, res) {
    try {

        const user = req.body;


        /* VALIDATION (JOI) */

        const userSchema = joi.object({
            name: joi.string().required(),
            email: joi.string().email().required(),
            password: joi.string().required(),
            confirmPassword: joi.string().required()
        });

        const validation = userSchema.validate(user);

        if (validation.error) {
            console.log(`signupPOST/VALIDATION (JOI) - ${validation.error}`);
            res.sendStatus(422);
            return;
        }


        /* CONFIRM PASSWORD */

        if (user.password !== user.confirmPassword) {
            console.log(`signupPOST/CONFIRM PASSWORD`);
            res.sendStatus(422);
            return;
        }
        

        /* DUPLICATE CHECK */

        const result = await connection.query('SELECT * FROM users WHERE email = $1', [user.email]);

        if(result.rows[0]) {
            console.log(`signupPOST/DUPLICATE CHECK`);
            res.sendStatus(409);
            return;
        }


        /* ENCRYPT PASSWORD */

        user.password = bcrypt.hashSync(user.password, 10);


        /* ADD TO DATABASE */

        await connection.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [user.name, user.email, user.password]);
        res.sendStatus(201);

    } catch (error) {
        console.log(`signupPOST - ${error}`);
        res.sendStatus(500);
    }
}

export async function signinPOST(req, res) {
    try {

    } catch (error) {
        console.log(`signinPOST - ${error}`);
        res.sendStatus(500);
    }
}