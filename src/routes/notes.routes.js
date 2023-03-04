const commonCtrls = require('~/controllers/common.controllers');
const notesCtrls = require('~/controllers/notes.controllers');
const schema = require('~/schemas/index');
const { validate } = require('~/lib/ajv');
/**
 * @type { Routes.default }
 */
module.exports = {
  prefix: '/notes',
  routes: [
    {
      path: '/',
      methods: {
        get: {
          middlewares: [commonCtrls.isAuthenticated, notesCtrls.getAllNotes],
        },
        post: {
          middlewares: [
            validate(schema.createNote),
            commonCtrls.isAuthenticated,
            notesCtrls.createNote,
          ],
        },
      },
    },
    {
      path: '/:id',
      methods: {
        get: {
          middlewares: [
            validate(schema.getNoteById, 'params'),
            commonCtrls.isAuthenticated,
            notesCtrls.getNoteByID,
          ],
        },
        put: {
          middlewares: [
            validate(schema.getNoteById, 'params'),
            validate(schema.createNote),
            commonCtrls.isAuthenticated,
            notesCtrls.updateNote,
          ],
        },
        delete: {
          middlewares: [
            validate(schema.getNoteById, 'params'),
            commonCtrls.isAuthenticated,
            notesCtrls.deleteNote,
          ],
        },
      },
    },
    {
      path: '/:id/share',
      methods: {
        post: {
          middlewares: [
            validate(schema.getNoteById, 'params'),
            validate(schema.shareNote),
            commonCtrls.isAuthenticated,
            notesCtrls.shareNote,
          ],
        },
      },
    },
  ],
};
