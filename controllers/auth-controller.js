'use-strict';

const accessTokenSecret = require('../auth/secrets').accessTokenSecret;
const authService = require('../services/auth-service');
const errHandler = require('../helpers/error-handler');
const jwt = require('jsonwebtoken');

module.exports = {
    login: async function (user) {
        const isAuthorized = await authService.isUserAuthorized(user);
        if (isAuthorized) {
            const userFound = await authService.findUserByEmail(user.email);
            const accessToken = jwt.sign({ id: userFound.id, email: userFound.email, role: userFound.role }, accessTokenSecret);
            return {id: userFound.id, email: userFound.email, token: accessToken };
        } else {
            return null;
        }
    },

    addUser: async function (user) {
        return await authService.addUser(user);
    }
}