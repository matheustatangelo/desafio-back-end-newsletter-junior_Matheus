const express = require('express');
const Joi = require('joi');

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'password',
        database: 'my_db',
    },
});
const app = express();
const PORT = 3000;

const registrationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    cpf: Joi.string().required(),
    phone: Joi.string().required(),
});

app.post('/registration', async (req, res, next) => {
    try {
        const { error, value } = registrationSchema.validate(req.body);
        if (error) {
            throw new Error(error.details[0].message);
        }

        const emailExists = await knex('forms_answers')
            .where('email', value.email)
            .first();
        if (emailExists) {
            throw new Error('Email already registered');
        }

        const registration = await knex('forms_answers').insert({
            name: value.name,
            email: value.email,
            cpf: value.cpf,
            phone: value.phone,
            created_at: new Date(),
        });

        return res.json({
            success: true,
            registration,
        });
    } catch (err) {
        return next(err);
    }
});

app.get('/registration/report', async (req, res, next) => {
    try {
        const { start_date, end_date } = req.query;
        const registrations = await knex('forms_answers')
            .whereBetween('created_at', [start_date, end_date]);

        return res.json({
            success: true,
            registrations,
        });
    } catch (err) {
        return next(err);
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json({
        success: false,
        message: err.message,
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
