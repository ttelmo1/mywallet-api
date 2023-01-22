import { v4 as uuidV4 } from 'uuid';
import db from '../config/database.js';
import bcrypt from 'bcrypt';
import { userSchema } from '../model/userSchema.js';
import { loginSchema } from '../model/loginSchema.js';



export async function signUp(req, res) {
    const { name, email, password, repeatPassword } = req.body;
    const result = userSchema.validate({ name, email, password, repeatPassword });
    
    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }
    const passwordHashed = bcrypt.hashSync(password, 10)
    try {
        const user = await db.collection('users').findOne({ email });
        if (user) {
            return res.sendStatus(409);
        }
        await db.collection('users').insertOne({ name, email, password: passwordHashed });
        res.sendStatus(201);
    }
    catch (error) {
        res.sendStatus(500);
    }

}

export async function signIn(req, res) {
    const { email, password } = req.body;
    const result = loginSchema.validate({ email, password });
    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }
    try {
        const user = await db.collection('users').findOne({ email });
        const isCorrectPassword = bcrypt.compareSync(password, user.password)
        if(!isCorrectPassword){
            return res.status(400).send("Usuário ou senha incorretos");
        }

        const token = uuidV4();
        await db.collection("sessions").insertOne({idUsuario: user._id, token})

        res.sendStatus(200).send({token});
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}