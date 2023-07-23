import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
dotenv.config();

const pgp = pgPromise();
const connection = {
    host: 'localhost',
    port: 5432,
    database: 'bitespeed',
    user: process.env.Postgre_username,
    password: process.env.Postgre_password
};

const db = pgp(connection);

export default db;
