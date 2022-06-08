import connection from "./db.js";

export async function signupPOST(req, res) {
    try {
        const result = await connection.query('SELECT * FROM users');
        res.send(result.rows)
    } catch (error) {
        console.log(`signupPOST ${error}`);
        res.sendStatus(500);
    }
}

export async function signinPOST(req, res) {
    try {

    } catch (error) {
        console.log(`signinPOST ${error}`);
        res.sendStatus(500);
    }
}