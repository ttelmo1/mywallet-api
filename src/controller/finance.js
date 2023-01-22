import db from "../config/database.js";
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br.js';
import { entrySchema } from "../model/entrySchema.js";
import { ObjectId } from "mongodb";


export async function newEntry(req, res) {
    const { description, value, type } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        return res.sendStatus(422);
    }
    

    const result = entrySchema.validate({ description, value, type });

    if (result.error) {
        return res.status(422).send(result.error.details[0].message);
    }
    try {
        const session = await db.collection('sessions').findOne({ token });
        if(!session){
            return res.sendStatus(401);
        }
        
        await db.collection('transactions').insertOne({ description, value, date: dayjs().format('DD/MM'), type, idUsuario: session.idUsuario});
        res.sendStatus(201);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}


export async function getEntries(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        return res.sendStatus(422);
    }
    try {
        const session = await db.collection('sessions').findOne({ token }); 
        if(!session){
            return res.sendStatus(401);
        }
        const transactions = await db.collection('transactions').find({ idUsuario: session.idUsuario }).toArray();
        res.send(transactions);
    }
    catch (error) {
        res.sendStatus(500);
    } 
}

export async function deleteEntry(req, res) {  
    const { id } = req.params;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        return res.sendStatus(422);
    }
    try {
        const session = await db.collection('sessions').findOne({ token });
        if(!session){
            return res.sendStatus(401);
        }
        const transaction = await db.collection('transactions').findOne({ _id: new ObjectId(id) });
        if (!transaction) {
            return res.sendStatus(404);
        }
        await db.collection('transactions').deleteOne({ _id: transaction._id });
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}


export async function editEntry(req, res) {
    const { id } = req.params;
    const { description, value, type } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        return res.sendStatus(422);
    }
    try {
        const session = await db.collection('sessions').findOne({ token });
        if(!session){
            return res.sendStatus(401);
        }
        const transaction = await db.collection('transactions').findOne({ _id: new ObjectId(id) });
        if (!transaction) {
            return res.sendStatus(404);
        }
        await db.collection('transactions').updateOne({ _id: transaction._id }, { $set: { description, value, type } });
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
    }
}