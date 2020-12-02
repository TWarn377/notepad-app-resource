'use-strict';

const noteService = require('../services/note-service');

module.exports = {
    

    getNote: async (noteId, userId, userEmail) => {
        return await noteService.getNote(noteId, userEmail, userId);
    },

    getNotesForUser: async (userId, userEmail) => {
        let notes = await noteService.getNotes(userEmail);
        notes.forEach(note => note.shared = false );

        let sharedNotes = await noteService.getSharedNotes(userId);
        sharedNotes.forEach(note => note.shared = true );

        return notes.concat(sharedNotes);
    },

    getAllNotes: async () => {
        return await noteService.getAllNotes();
    },

    addNote: async (note) => {
        const sharedUsers = note.sharedUsers;
        delete note.sharedUsers;

        
    },

    updateNote: async () => {

    },
}