'use-strict';

const noteService = require('../services/note-service');
const errHandler = require('../helpers/error-handler');


module.exports = {
    getNote: async (noteId, userId, userEmail) => {
        let note = await noteService.getNote(noteId, userEmail, userId);
        note.categories = note.categories.split('(?,)');
        return note;
    },

    getNotesForUser: async (userId, userEmail) => {
        let notes = await noteService.getNotes(userEmail);
        notes.forEach(note => note.shared = false );

        let sharedNotes = await noteService.getSharedNotes(userId);
        sharedNotes.forEach(note => note.shared = true );

        let allNotes = notes.concat(sharedNotes);
        // allNotes.forEach(note => )

        return allNotes;
    },

    getAllNotes: async () => {
        try {
            return await noteService.getAllNotes();
        } catch (err) {
            throw err;
        }
    },

    addNote: async (note, userId) => {
        try {
            return await noteService.addNote(note, userId);
        } catch (err) {
            throw err;
        }
    },

    deleteNote: async (note, userEmail, userId) => {
        try {
            if (await noteService.isDeleteAuthorized(note, userEmail, userId)) {
                await noteService.deleteNote(note.id);
                return 'Note deleted.';
            } else {
                throw errHandler.toError('Making changes to this note is forbidden.', 403);
            }
        } catch (err) {
            if (!(Boolean(err.code) || Boolean(err.message))) {
                console.error(err);
                throw errHandler.toError('An error occured when attempting to delete note', 500);
            }
            throw err;
        }
    },

    updateNote: async (note, userEmail, userId) => {
        try {
            if (await noteService.isChangeAuthorized(note, userEmail, userId)) {
                return await noteService.updateNote(note);
            } else {
                throw errHandler.toError('Making changes to this note is forbbidden.', 403);
            }
        } catch (err) {
            throw err;
        }
    },
}