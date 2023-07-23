import express from 'express';
import ContactsController from '../controllers/contactsController';
import { validateContact } from '../validation';

const router = express.Router();

router.post('/identify', validateContact, ContactsController.identify);

export default router;
