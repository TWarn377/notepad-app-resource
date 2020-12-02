'use-strict';

const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('./secrets');

module.exports = {
    authUserJWT: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];

            jwt.verify(token, accessTokenSecret, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                req.user = user;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    },

    authAdminJWT: (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];

            jwt.verify(token, accessTokenSecret, (err, user) => {
                if (err) {
                    return res.sendStatus(403);
                }

                if (user.role !== 'admin') {
                    return res.sendStatus(401);
                }

                req.user = user;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    }
}