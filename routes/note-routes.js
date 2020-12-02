'use-strict';

const { authUserJWT, authAdminJWT } = require('../auth/jwt');
const Joi = require('joi');

module.exports = function (app) {
    app.get('/notes', authAdminJWT, async (req, res) => {
        res.send('GET ALL NOTES');
    });

    app.get('/notes/:userId', authUserJWT, async (req, res) => {
        console.log(req.user);
        res.send('GET NOTES');
    });

    app.get('/note/:noteId', authUserJWT, async (req, res) => {
        res.send('GET NOTE');
    });

    app.post('/note', authUserJWT, async (req, res) => {
        res.send('UPDATE NOTE');
    });

    app.put('/note', authUserJWT, async (req, res) => {
        res.send('ADD NOTE');
    });

    app.delete('/note', authAdminJWT, async (req, res) => {
        res.send('DELETE NOTE');
    });
}