import express from 'express';
import contactsRouter from './routes/contacts';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/contacts', contactsRouter);

app.listen(port, () => {
    console.log(`🚀🚀Server is running at http://localhost:${port}`);
});
