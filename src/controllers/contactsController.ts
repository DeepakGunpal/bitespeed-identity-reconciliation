import { Request, Response } from 'express';
import Contact from '../models/contactsModel';
import { ContactParams } from '../interfaces/contactInterface';

class ContactsController {
    static async identify(req: Request, res: Response) {
        const params: ContactParams = req.body;
        const { phoneNumber, email } = params;

        try {
            // Query the database to find any existing contacts matching the request info
            let contact = await Contact.find({ phoneNumber, email });
            console.log("contact already exist✅", contact);
            // If no match, create a new contact with linkPrecedence as "primary"
            if (!contact) {
                contact = await Contact.create({ ...params, linkPrecedence: 'primary' });
                return res.json({
                    "contact": {
                        "primaryContatctId": contact.id,
                        "emails": [contact.email],
                        "phoneNumbers": [contact.phonenumber],
                        "secondaryContactIds": []
                    }
                });
            }

            // If match found, link new contact to existing primary contact as "secondary"
            if (contact?.phonenumber !== phoneNumber || contact?.email !== email) {
                const newContact = await Contact.create({ ...params, linkedId: contact.id, linkPrecedence: 'secondary' });
                return res.json(newContact);
            }

            // Handle cases like existing primary contact turning secondary based on new info
            if (contact.linkprecedence === 'secondary') {
                await Contact.update(contact.id, { linkPrecedence: 'primary' });
                await Contact.update(contact.linkedid, { linkPrecedence: 'secondary' });
            }

            // Return formatted response with consolidated contact info
            // Todo: format response
            // {
            //     "contact": {
            //         "primaryContatctId": contact.id,
            //         "emails": [contact.email],
            //         "phoneNumbers": [contact.phonenumber],
            //         "secondaryContactIds": []
            //     }
            // }
            const updatedContact = await Contact.find({ id: contact.id });
            return res.json(updatedContact);
        } catch (err) {
            console.log(err);
            res.status(500).send('Server error');
        }
    }
}

export default ContactsController;
