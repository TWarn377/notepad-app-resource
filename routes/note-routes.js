'use-strict';

const { authUserJWT, authAdminJWT } = require('../auth/jwt');
const noteController = require('../controllers/note-controller');
const Joi = require('joi');
const { number, array, date, string } = require('joi');

module.exports = function (app) {
    app.get('/notes', authAdminJWT, async (req, res) => {
        try {
            res.json(await noteController.getAllNotes());
        } catch (err) {
            res.status(err.code).send({ errorMessage: err.message });
        }

    });

    app.get('/notes/:userId', authUserJWT, async (req, res) => {
        const userId = req.user.id;
        const userEmail = req.user.email;
        res.json(await noteController.getNotesForUser(userId, userEmail));
    });

    // app.get('/note/:noteId', authUserJWT, async (req, res) => {
    //     res.send('GET NOTE');
    // });

    app.post('/note', authUserJWT, async (req, res) => {
        try {
            console.log('NOTE POST HIT!');
            const { body } = req;
            // const noteSchema = Joi.object().keys({
            //     id: number().required().error(err => console.error(err)),
            //     title: string().error(err => console.error(err)),
            //     note: string().required().error(err => console.error(err)),
            //     categories: array().items(string()).required().error(err => console.error(err)),
            //     date_created: date().iso().required().error(err => console.error(err)),
            //     date_modified: date().iso().required().error(err => console.error(err)),
            //     reminder: date().iso().error(err => console.error(err)),
            //     type: string().required().error(err => console.error(err)),
            //     shared_users: array().items(number()).error(err => console.error(err)),
            //     owner: string().email().required().error(err => console.error(err))
            // });
            // console.log(noteSchema.validate(body));
            // const noteValid = noteSchema.validate(body);

            // console.log('NOTE POST TRIGGER 1');
            // if (!noteValid) {
            //     res.status(422).json({
            //         message: 'Invalid Request',
            //         data: body
            //     });
            // }
            // console.log('NOTE POST TRIGGER 2');

            const userEmail = req.user.email;
            const userId = req.user.id;
            res.json(await noteController.updateNote(body, userEmail, userId));
            
        } catch (err) {
            console.error(err);
            res.status(err.code).send({ errorMessage: err.message });
        } 
    });

    app.put('/note', authUserJWT, async (req, res) => {
        try {
            const { body } = req;

            // PLACE JOI SCHEMA HERE

            const userId = req.user.id;
            res.json(await noteController.addNote(body, userId));
        } catch (err) {
            res.status(err.code).send({ errorMessage: err.message });
        }
    });

    app.delete('/note', authUserJWT, async (req, res) => {
        try {
            const { body } = req;

            // PLACE JOI SCHEMA HERE

            const userEmail = req.user.email;
            const userId= req.user.id;
            res.send(await noteController.deleteNote(body, userEmail, userId));
        } catch (err) {
            console.error(err);
            res.status(err.code).send({ errMessage: err.message });
        }
    });
}