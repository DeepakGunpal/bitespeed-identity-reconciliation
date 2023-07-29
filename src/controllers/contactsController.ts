import { Request, Response } from 'express';
import ContactModel from '../models/contactsModel';
import { Contact, ContactParams } from '../interfaces/contactInterface';
/**
 * find all contacts matching the request info
 * if(length == 0) create new contact
 * if(length > 0) find primary contact
 * if(primaryContact > 1) make latest contact as secondary contact
 * check if incoming request contains new information
 * if(newInfo) create secondary contact
 * else send consolidated contact based of above received all contacts
 */

const internals = {
    findLatestPrimaryContactAndMakeItSecondary: async (contact1: Contact, contact2: Contact) => {
        if (contact1?.createdat < contact2?.createdat) {
            await ContactModel.update(contact2?.id, { linkPrecedence: 'secondary', linkedId: contact1.id });
            return contact1;
        } else {
            await ContactModel.update(contact1?.id, { linkPrecedence: 'secondary', linkedId: contact2.id });
            return contact2;
        }
    }
}
class ContactsController {
    static async identify(req: Request, res: Response) {
        const params: ContactParams = req.body;
        const { phoneNumber, email } = params;

        try {
            // Find all contacts matching the request info
            let allContacts = await ContactModel.findAll({ phoneNumber, email });
            console.log("contact already exist✅", allContacts);
            // If no match, create a new contact with linkPrecedence as "primary"
            if (allContacts.length === 0) {
                const newContact = await ContactModel.create({ ...params, linkPrecedence: 'primary' });
                console.log("new primary contact created✅", newContact);
                return res.json({
                    "contact": {
                        "primaryContatctId": newContact.id,
                        "emails": [newContact.email],
                        "phoneNumbers": [newContact.phonenumber],
                        "secondaryContactIds": []
                    }
                });
            }

            let uniqueEmails: string[] = [];
            let uniquePhoneNumbers: string[] = [];
            let newPhoneNumber: string | null = null;
            let newEmail: string | null = null;
            //find group primary contact and secondary contact
            let groupPrimaryAndSecondaryContacts = allContacts.reduce((acc, contact) => {
                if (contact.linkprecedence === 'primary') acc.primaryContacts.push(contact);
                else acc.secondaryContacts.push(contact);
                if (!uniqueEmails.includes(contact.email)) uniqueEmails.push(contact.email);
                if (!uniquePhoneNumbers.includes(contact.phonenumber)) uniquePhoneNumbers.push(contact.phonenumber);
                return acc;
            }, { primaryContacts: [], secondaryContacts: [] });

            let primaryContacts: Contact[] = groupPrimaryAndSecondaryContacts?.primaryContacts || []
            console.log("group primary contacts and secondary contacts", groupPrimaryAndSecondaryContacts)
            let primaryContact: Contact;
            //if more than 1 primary contact found make latest contact as secondary contact
            if (primaryContacts.length > 1) {
                primaryContact = await internals.findLatestPrimaryContactAndMakeItSecondary(primaryContacts[0], primaryContacts[1])
            }
            else {
                if (!primaryContacts[0]) {
                    primaryContact = await ContactModel.find({ id: allContacts[0]?.linkedid })
                } else primaryContact = primaryContacts[0];
                //check if request info contains any new information
                if (email && !uniqueEmails.includes(email)) newEmail = email;
                if (phoneNumber && !uniquePhoneNumbers.includes(phoneNumber)) newPhoneNumber = phoneNumber;
            }
            console.log("primaryContact", primaryContact)

            //existing secondary contacts of primary contact
            const existingSecondaryContacts: Contact[] = await ContactModel.findAll({ linkedId: primaryContact.id })
            let secondaryContactEmails: string[] = [...groupPrimaryAndSecondaryContacts?.secondaryContacts?.map((contact: Contact) => contact.email), ...existingSecondaryContacts?.map(contact => contact.email)]
            let secondaryContactPhoneNumbers: string[] = [...groupPrimaryAndSecondaryContacts?.secondaryContacts?.map((contact: Contact) => contact.phonenumber), ...existingSecondaryContacts?.map(contact => contact.phonenumber)]
            let secondaryContactIds: string[] = [...groupPrimaryAndSecondaryContacts?.secondaryContacts?.map((contact: Contact) => contact.id), ...existingSecondaryContacts?.map(contact => contact.id)]
            console.log(
                "secondaryContactEmails: ", secondaryContactEmails,
                "secondaryContactPhoneNumbers: ", secondaryContactPhoneNumbers,
                "secondaryContactIds: ", secondaryContactIds
            )

            //consolidated contact info
            const consolidatedContact = {
                "contact": {
                    "primaryContatctId": primaryContact?.id,
                    "emails": Array.from(new Set([primaryContact?.email, ...secondaryContactEmails])),
                    "phoneNumbers": Array.from(new Set([primaryContact?.phonenumber, ...secondaryContactPhoneNumbers])),
                    "secondaryContactIds": Array.from(new Set(secondaryContactIds))
                }
            }

            //create secondary contact if new information is available
            if (newEmail || newPhoneNumber) {
                const newContact = await ContactModel.create({ ...params, linkPrecedence: 'secondary', linkedId: primaryContact.id });
                console.log("new secondary contact created✅", newContact);
                if (newEmail) consolidatedContact.contact.emails.push(newContact.email)
                if (newPhoneNumber) consolidatedContact.contact.phoneNumbers.push(newContact.phonenumber)
                consolidatedContact.contact.secondaryContactIds.push(newContact.id)
            }

            return res.json(consolidatedContact);
        } catch (err) {
            console.log(err);
            res.status(500).send('Server error');
        }
    }
}

export default ContactsController;
