const commonCtrls = require('~/controllers/common.controllers');
const notesCtrls = require('~/controllers/notes.controllers');

/**
 * @type { Routes.default }
 */
module.exports = {
  prefix: '/search',
  routes: [
    {
      path: '/',
      methods: {
        get: {
          middlewares: [commonCtrls.isAuthenticated, notesCtrls.search],
        },
      },
    },
  ],
};
