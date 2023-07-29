import express from 'express';
import contactsRouter from './routes/contacts';
import dotenv from 'dotenv';
import setupDatabase from './setupDatabase';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/contacts', contactsRouter);
setupDatabase();
app.listen(port, () => {
    console.log(`🚀🚀Server is running at http://localhost:${port}`);
});
