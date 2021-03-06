'use-script';

const { authUserJWT, authAdminJWT } = require('../auth/jwt');
const authController = require('../controllers/auth-controller');
const Joi = require('joi');
const { min } = require('../db/db');

module.exports = function(app) {

    app.post('/login', async (req, res) => {
        try {
            const { body } = req;
            const loginSchema = Joi.object().keys({
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required(),
            }); 
            const bodyValid = loginSchema.validate(body);
            
            if (!bodyValid) {
                res.status(422).json({
                    message: 'Invalid Request',
                    data: body
                });
            } else {
                const userData = await authController.login(body);
                res.json({ message: 'Login Successful!', 
                    id: userData.id,
                    email: userData.email,
                    token: userData.token
                });
            }
        } catch (err) {
            console.error(err);
            res.status(err.code);
        }
    });

    app.put('/user', async (req, res) => {
        try {
            const { body } = req;
            const userSchema = Joi.object().keys({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
                fname: Joi.string().required(),
                lname: Joi.string().required(),
                phone: Joi.string(),
                role: Joi.string().required()
            });

            const bodyValid = userSchema.validate(body);

            if (!bodyValid) {
                res.status(422).json({
                    message: 'Invalid Request',
                    data: body
                });
            } else {
                const resp = await authController.addUser(body);
                console.log(resp);
                res.json(resp);
            }

        } catch (err) {
            console.error(err);
            res.json({
                message: `Error adding user: [${err.message}]`,
                code: err.code
            });
        } 
    });

    app.get('/status', (req, res) => {
        res.send('Success');
    });
}
