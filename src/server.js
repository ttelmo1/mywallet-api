import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import Joi from 'joi';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br.js';
import { MongoClient } from 'mongodb';

dotenv.config();
const server = express();
server.use(cors());
server.use(express.json());
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try{
    await mongoClient.connect();
    db = mongoClient.db();
    console.log('Conectado ao banco de dados');
}
catch(error){
    console.log('Erro ao conectar ao banco de dados');
}

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

