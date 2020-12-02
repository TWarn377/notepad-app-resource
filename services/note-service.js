'use-strict';

const errHandler = require('../helpers/error-handler');
const db = require('../db/db');


const NOTES_TABLE = 'notes';
const SHARED_NOTES_TABLE = 'notes_shared_users';

module.exports = {

    addNote: async function (note) {
        try {
        return await db(NOTES_TABLE)
            .insert(note)
            .returning('id');
        } catch (err) {
            console.error(err);
        }
    },

    getNote: async function (noteId, userEmail, userId) {
        try {
        return await db(SHARED_NOTES_TABLE)
            .innerJoin(NOTES_TABLE, `${NOTES_TABLE}.id`, `${SHARED_NOTES_TABLE}.notes_id`)
            .select('*')
            .where('id', noteId)
            .andWhere(() => {
                this.where('users_id', userId)
                .orWhere('owner', userEmail) 
            })
            .first();
        } catch (err) {
            console.error(err);
        }
    },

    getNotes: async function (userEmail) {
        try {
            return await db(NOTES_TABLE)
                .select('*')
                .where('owner', userEmail);
        } catch (err) {
            console.error(err);
        }
    },

    getAllNotes: async function () {
        try {
            return await db(NOTES_TABLE)
                .select('*');
        } catch (err) {
            console.error(err);
        }
    },

    getSharedNotes: async function (userId) {
        try {
            return await db(SHARED_NOTES_TABLE)
                .innerJoin(NOTES_TABLE, `${NOTES_TABLE}.id`, `${SHARED_NOTES_TABLE}.notes_id`)
                .where('users_id', userId);
        } catch (err) {
            console.error(err);
        }
    },

    updateNote: async function (note, userEmail) {
        try {
            const noteId = note.id;
            delete note.id;
            const sharedUsers = note.sharedUsers;
            delete note.sharedUsers;

            return await db.transaction((trx) => {
                trx(NOTES_TABLE)
                .where('id', noteId)
                .update(note, 'id').then((id) => {
                    
                })
            });
        } catch (err) {
            console.error(err);
        }
    },

    deleteNote: async function (noteId, userEmail) {
        try {
            return await db(NOTES_TABLE)
                .where({ id: noteId, owner: userEmail })
                .del();
        } catch(err) {
            console.error(err);
        }
    }
};