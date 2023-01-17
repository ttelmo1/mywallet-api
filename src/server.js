import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import Joi from 'joi';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br.js';
import { MongoClient } from 'mongodb';

const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.required(),
    repeatPassword: Joi.ref('password')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.required()
});



dotenv.config();
const server = express();
server.use(cors());
server.use(express.json());
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
    await mongoClient.connect();
    db = mongoClient.db();
    console.log('Conectado ao banco de dados');
}
catch (error) {
    console.log('Erro ao conectar ao banco de dados');
}

server.post('/sign-up', async (req, res) => {
    const { name, email, password } = req.body;
    const result = userSchema.validate({ name, email, password });
    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }
    try {
        const user = await db.collection('users').findOne({ email });
        if (user) {
            return res.sendStatus(409);
        }
        await db.collection('users').insertOne({ name, email, password });
        res.sendStatus(201);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

});

server.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;
    const result = loginSchema.validate({ email, password });
    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }
    try {
        const user = await db.collection('users').findOne({ email });
        if (!user || user.password !== password) {
            return res.sendStatus(401);
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});






const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

