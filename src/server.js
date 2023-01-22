import express from 'express';
import cors from 'cors';
import authRouter from '../src/routes/authRoutes.js';
import financeRouter from '../src/routes/financeRoutes.js';

const server = express();
server.use(express.json());
server.use(cors());

server.use([authRouter, financeRouter]);

const PORT = 5000;
console.log('Rodando na porta 5000');

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

