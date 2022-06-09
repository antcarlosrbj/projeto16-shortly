import connection from "./../controllers/db.js";
import jwt from 'jsonwebtoken';

export async function verifyToken(req, res, next) {
    try {

        /* IS THERE TOKEN? */

        const { authorization } = req.headers

        if (!authorization) {
            console.log(`verifyToken/IS THERE TOKEN?`);
            res.sendStatus(401);
            return;
        }

        const token = authorization.replace('Bearer ', '');
        
        if (!token) {
            console.log(`verifyToken/IS THERE TOKEN?`);
            res.sendStatus(401);
            return;
        }

        
        /* JWT VERIFY */

        jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
            if (err) {
                console.log(`verifyToken/JWT VERIFY - ${err}`);
                res.sendStatus(401);
                return;
            }

            /* IS THERE THAT USER? */

            const result = await connection.query('SELECT * FROM users WHERE email = $1', [decoded.email]);

            if(!result.rows[0]) {
                console.log(`verifyToken/IS THERE THAT USER?`);
                res.sendStatus(401);
                return;
            }
            
            
            res.locals.id = result.rows[0].id;
            next();
        });
        

    } catch (error) {
        console.log(`verifyToken - ${error}`);
        res.sendStatus(500);
    }
}
