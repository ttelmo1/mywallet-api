import { MongoClient } from "mongodb";
import * as dotenv from 'dotenv';

dotenv.config();
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

export default db;