import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import Joi from 'joi';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br.js';
import { MongoClient, ObjectId } from 'mongodb';

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

const entrySchema = Joi.object({
    description: Joi.string().required(),
    value: Joi.number().required(),
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

server.post('/new-entry', async (req, res) => {
    const { description, value } = req.body;
    const from = req.headers.user;
    const result = entrySchema.validate({ description, value });
    const user = await db.collection('users').find({ from })

    if(!user || !from){
        return res.sendStatus(422);
    }

    if (result.error) {
        return res.status(400).send(result.error.details[0].message);
    }
    try {
        await db.collection('transactions').insertOne({ description, value, date: dayjs().format('DD/MM'), from });
        res.sendStatus(201);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

server.get('/entries', async (req, res) => {
    const from = req.headers.user;
    const user = await db.collection('users').find({ from })

    if(!user || !from){
        return res.sendStatus(422);
    }
    try {
        const transactions = await db.collection('transactions').find({ from }).toArray();
        res.send(transactions);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

server.delete('/entries/:id', async (req, res) => {  
    const { id } = req.params;
    const from = req.headers.user;
    const user = await db.collection('users').find({ from })

    if(!user || !from){ 
        return res.sendStatus(422);
    }
    
    try {
        const transaction = await db.collection('transactions').findOne({ _id: ObjectId(id) });
        if (!transaction) {
            return res.sendStatus(404);
        }

        await db.collection('transactions').deleteOne({ _id: ObjectId(id) });
        res.sendStatus(200);

        
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

server.put('/entries/:id', async (req, res) => {
    const { id } = req.params;
    const { description, value } = req.body;
    const from = req.headers.user;
    const user = await db.collection('users').find({ from })

    if(!user || !from){
        return res.sendStatus(422);
    }
    try {
        const transaction = await db.collection('transactions').findOne({ _id: new ObjectId(id) });
        if (!transaction) {
            return res.sendStatus(404);
        }
        await db.collection('transactions').updateOne({ _id: transaction._id }, { $set: { description, value } });
        res.status(200).send({ transaction });
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

