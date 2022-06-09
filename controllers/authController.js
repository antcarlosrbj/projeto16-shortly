import connection from "./db.js";
import joi from "joi";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


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
            res.status(422).send(validation.error);
            return;
        }


        /* CONFIRM PASSWORD */

        if (user.password !== user.confirmPassword) {
            console.log(`signupPOST/CONFIRM PASSWORD`);
            res.status(422).send("Senhas devem ser iguais");
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

        const user = req.body;


        /* VALIDATION (JOI) */

        const userSchema = joi.object({
            email: joi.string().email().required(),
            password: joi.string().required()
        });

        const validation = userSchema.validate(user);

        if (validation.error) {
            console.log(`signinPOST/VALIDATION (JOI) - ${validation.error}`);
            res.status(422).send(validation.error);
            return;
        }
        

        /* CHECK IN THE DATABASE */
        
        const result = await connection.query('SELECT * FROM users WHERE email = $1', [user.email]);
        
        if(!result.rows[0]) {
            console.log(`signinPOST/CHECK IN THE DATABASE`);
            res.sendStatus(401);
            return;
        }
        
        if (!bcrypt.compareSync(user.password, result.rows[0].password)) {
            console.log(`signinPOST/CHECK IN THE DATABASE/PASSWORD DOES NOT MATCH`);
            res.sendStatus(401);
            return;
        }
        

        /* TOKEN SEND */

        const token = jwt.sign({ email: user.email },
            process.env.JWT_SECRET, { expiresIn: 2592000 }
        );
        
        res.send(token);

    } catch (error) {
        console.log(`signinPOST - ${error}`);
        res.sendStatus(500);
    }
}