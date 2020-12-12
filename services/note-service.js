'use-strict';

const errHandler = require('../helpers/error-handler');
const dbUtils = require('../helpers/db-utils');
const db = require('../db/db');


const NOTES_TABLE = 'notes';
const SHARED_NOTES_TABLE = 'notes_shared_users';

module.exports = {

    addNote: async function (note, userId) {
        try {
            note.categories = note.categories.join('(?,)');
            note.date_created = dbUtils.jsToSQLDate(note.date_created);
            note.date_modified = dbUtils.jsToSQLDate(note.date_modified);
            note.reminder = dbUtils.jsToSQLDate(note.reminder);

            const sharedUsers = note.shared_users;
            delete note.shared_users;
            const sharedUsersObjArr = [];

            delete note.id;
            let newNoteId = -1;
            
            await db.transaction(async trx => {
                newNoteId = (await trx(NOTES_TABLE)
                    .insert(note)
                    .returning('id'))[0];

                sharedUsers.forEach(userId => {
                    sharedUsersObjArr.push({ notes_id: newNoteId, users_id: userId });
                });

                await trx(SHARED_NOTES_TABLE)
                    .insert(sharedUsersObjArr);
            });

            return newNoteId;
        } catch (err) {
            console.error(err);
            throw errHandler.toError(`Error adding note: ${note.title}`, 500);
        }
    },

    getNote: async function (noteId, userEmail, userId) {
        try {
            let note;
            await db.transaction(async trx =>  {
                note = await trx(SHARED_NOTES_TABLE)
                    .innerJoin(NOTES_TABLE, `${NOTES_TABLE}.id`, `${SHARED_NOTES_TABLE}.notes_id`)
                    .select('*')
                    .where('id', noteId)
                    .andWhere(() => {
                        this.where('users_id', userId)
                        .orWhere('owner', userEmail) 
                    })
                    .first();

                note.shared_users = await this.getSharedUsers(note.id, trx);
                note.categories = note.categories.split('(?,)');
            });

            return note;
        } catch (err) {
            console.error(err);
        }
    },

    getNotes: async function (userEmail) {
        try {
            let notes = [];
            await db.transaction(async trx => {
                notes = await trx(NOTES_TABLE)
                    .select('*')
                    .where('owner', userEmail);

                for (let i in notes) {
                    notes[i].shared_users = await this.getSharedUsers(notes[i].id, trx);
                    notes[i].categories = notes[i].categories.split('(?,)');
                }
            });
            return notes;
        } catch (err) {
            console.error(err);
            throw errHandler.toError('An error occured when trying to retrieve all your notes.', 500);
        }
    },

    getAllNotes: async function () {
        try {
            let allNotes = [];
            await db.transaction(async trx => {
                allNotes = await trx(NOTES_TABLE)
                    .select('*');
                
                for (let i in allNotes) {
                    allNotes[i].shared_users = await this.getSharedUsers(allNotes[i].id, trx);
                    allNotes[i].categories = allNotes[i].categories.split('(?,)');
                }
            });
            return allNotes;
        } catch (err) {
            console.error(err);
            throw errHandler.toError('An error occured when trying to retrieve all notes.', 500);
        }
    },

    getSharedNotes: async function (userId) {
        try {
            let sharedNotes = [];
            await db.transaction(async trx => {
                sharedNotes = await trx(SHARED_NOTES_TABLE)
                    .innerJoin(NOTES_TABLE, `${NOTES_TABLE}.id`, `${SHARED_NOTES_TABLE}.notes_id`)
                    .distinct()
                    .where('users_id', userId);
                
                for(let i in sharedNotes) {
                    sharedNotes[i].shared_users = await this.getSharedUsers(sharedNotes[i].id, trx);
                    sharedNotes[i].categories = sharedNotes[i].categories.split('(?,)');
                }
            });

            return sharedNotes;
        } catch (err) {
            console.error(err);
            throw errHandler.toError('An error occured when trying to retrieve all your shared notes.', 500);
        }
    },

    getSharedUsers: async function (noteId, trx) {
        let knex;
        trx? knex = trx : knex = db;
        return await knex(SHARED_NOTES_TABLE)
            .pluck('users_id')
            .where('notes_id', noteId);
    },

    isChangeAuthorized: async function (note, userEmail, userId) {
        try {
            let isAuthorized = false;
            await db.transaction(async trx => {
                const authorzedUsers = await trx(NOTES_TABLE)
                    .innerJoin(SHARED_NOTES_TABLE, `${SHARED_NOTES_TABLE}.notes_id`, `${NOTES_TABLE}.id`)
                    .where('id', note.id)
                    .distinct('owner', 'users_id');
                                
                authorzedUsers.forEach(entry => {
                    if (entry.owner === userEmail || entry.users_id === userId) {
                        isAuthorized = true;
                        return;
                    }
                });
            });
            // Get users authorized for note 
            return isAuthorized;
        } catch (err) {
            console.error(err);
            throw errHandler.toError(`Error authorizing user to update note: "${note.title}"`, 500);
        }
    }, 

    isDeleteAuthorized: async function (note, userEmail) {
        try {
            let isAuthorized = false;
            await db.transaction(async trx => {
                const authorzedUser = await trx(NOTES_TABLE)
                    .pluck('owner')
                    .where('id', note.id)
                    .first();

                isAuthorized = authorzedUser.owner === userEmail;
            });
            // Get users authorized for note 
            return isAuthorized;
        } catch (err) {
            console.error(err);
            throw errHandler.toError(`Error authorizing user to update note: "${note.title}"`, 500);
        }
    }, 

    updateNote: async function (note) {
        try {
            note.categories = note.categories.join('(?,)');
            note.date_created = dbUtils.jsToSQLDate(note.date_created);
            note.date_modified = dbUtils.jsToSQLDate(note.date_modified);
            note.reminder = dbUtils.jsToSQLDate(note.reminder);

            const noteId = note.id;
            delete note.id;
            const sharedUsers = note.shared_users;
            delete note.shared_users;

            await db.transaction(async trx => {

                const id = await trx(NOTES_TABLE)
                    .where('id', noteId)
                    .update(note, 'id');
                
                const userIds = await trx(SHARED_NOTES_TABLE)
                    .pluck('users_id')
                    .where('notes_id', id);
            
                const { add, del } = dbUtils.manyToManyDelta(sharedUsers, userIds, 'users_id');
                if (del.length > 0) {
                    await trx(SHARED_NOTES_TABLE)
                        .del()
                        .where('users_id', del);
                }
                
                if (add.length > 0) {
                    const newRows = add.map(userId => {return { notes_id: id, users_id: userId };});
                    await trx(SHARED_NOTES_TABLE)
                        .insert(newRows);
                }
            });

            return 'Note updated!';
        } catch (err) {
            console.error(err);
            throw errHandler.toError(`Error updating note: "${note.title}".`, 500);
        }
    },

    deleteNote: async function (noteId) {
        try {
            await db.transaction(async trx => {
                await trx(SHARED_NOTES_TABLE)
                    .where('notes_id', noteId)
                    .del();

                await trx(NOTES_TABLE)
                    .where('id', noteId)
                    .del();
            }); 
        } catch(err) {
            console.error(err);
            throw errHandler.toError('Error deleteing note.', 500);
        }
    }
};