import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const contactSchema = Joi.object({
    phoneNumber: Joi.number().optional(),
    email: Joi.string().email().optional(),
}).unknown(false);

export function validateContact(req: Request, res: Response, next: NextFunction) {
    const { error } = contactSchema.validate(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        next();
    }
}
