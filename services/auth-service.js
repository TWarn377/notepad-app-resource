'use-strict';
const bcrypt = require('bcrypt');
const errHandler = require('../helpers/error-handler');
const db = require('../db/db');
const saltRounds = 10;

const USERS_TABLE = 'users';

const encryptPassword = async function (password) {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (err) {
        throw new Error(err);
    }
};

const comparePassword = async function (userInput, password) {
    try {
        let result = false;

        return await bcrypt.compare(userInput, password);
    } catch (err)  {
        throw new Error(err);
    }
}

const shared = {
    addUser: async function (user) {
        try {
        user.password =  await encryptPassword(user.password); 
        return await db(USERS_TABLE).insert(user)
                .returning('id');
        } catch (err) {
            if (err.message && err.code) {
                console.error(err);
                throw new Error(errHandler.toError(`Unable to add user - ${user.fname}: [${err.message}]`, err.code));
            } else {
                console.error(err);
                throw new Error(errHandler.toError(`Unable to add user ${user.fname}: [${err}]`, 500));
            }
        }
    },

    deleteUser: async function (id) {
        try {
            return await db(USERS_TABLE).where('id', id).del();
        } catch (err) {
            throw new Error(errHandler.toError(`Unable to delete user ${id}: [${err}]`, 500));
        }
    },

    findUserByID: async function (id) {
        try {
            return await db(USERS_TABLE)
                .select('*')
                .where('id', id)
                .first();
        } catch (err) {
            throw new Error (errHandler.toError(`Unable to find user ${id}: [${err}]`, 500));
        } 
    },
    findUserByEmail: async function (email) {
        try {
            return await db(USERS_TABLE)
                .select('*')
                .where('email', email)
                .first();
        } catch (err) {
            console.error(err);
            throw new Error(errHandler.toError(`Unable to find user ${email}: [${err}]`, 500));
        }
    },

    findUser: async function (user) {
        try {
            return await db(USERS_TABLE)
                .select('*')
                .where(user)
                .first();
        } catch (err) {
            console.error(err);
            throw new Error(errHandler.toError(`Unable to find user ${user.email}: [${err}] `, 500));
        }
    },

    isUserAuthorized: async function (user) {
        try {
            userFound = await shared.findUserByEmail(user.email);
            if(!userFound) {
                throw new Error(errHandler.toError(`Unable to find user email: ${user.email}`));
            }
            
            return await comparePassword(user.password, userFound.password);
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }
}

module.exports = shared;