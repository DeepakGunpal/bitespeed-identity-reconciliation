import db from '../db/db';
import { ContactParams } from '../interfaces/contactInterface';

class ContactModel {
    static async find(params: ContactParams) {
        const keys = Object.keys(params);
        const values = Object.values(params);

        const query = `SELECT * FROM Contacts WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' OR ')}`;

        return db.oneOrNone(query, values);
    }
    static async findAll(params: ContactParams) {
        const keys = Object.keys(params);
        const values = Object.values(params);

        const query = `SELECT * FROM Contacts WHERE ${keys.map((key, i) => `${key} = $${i + 1}`).join(' OR ')}`;

        return db.manyOrNone(query, values);
    }

    static async create(params: ContactParams) {
        const keys = Object.keys(params);
        const values = Object.values(params);

        const query = `INSERT INTO Contacts (${keys.join(', ')}, createdAt, updatedAt) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}, NOW(), NOW()) RETURNING *`;

        return db.one(query, values);
    }

    static async update(id: number, params: ContactParams) {
        const keys = Object.keys(params);
        const values = [...Object.values(params), id];

        const query = `UPDATE Contacts SET ${keys.map((key, i) => `${key} = $${i + 1}`)} WHERE id = $${values.length} RETURNING *`;

        return db.one(query, values);
    }
}

export default ContactModel;
