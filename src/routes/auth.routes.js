const authCtrls = require('~/controllers/auth.controllers');
const { validate } = require('~/lib/ajv');
const schema = require('~/schemas/index');
/**
 * @type { Routes.default }
 */
module.exports = {
  prefix: '/auth',
  routes: [
    {
      path: '/register',
      methods: {
        post: {
          middlewares: [validate(schema.signup), authCtrls.register],
        },
      },
    },
    {
      path: '/login',
      methods: {
        post: {
          middlewares: [validate(schema.login), authCtrls.login],
        },
      },
    },
    {
      path: '/verifyCode',
      methods: {
        post: {
          middlewares: [
            validate(schema.confirmVerifyCode),
            authCtrls.checkCode(false),
            authCtrls.activateAccount(),
          ],
        },
        get: {
          middlewares: [
            validate(schema.confirmVerifyCode, 'query'),
            authCtrls.checkCode(false, 'query'),
            authCtrls.activateAccount('query'),
          ],
        },
      },
    },
  ],
};
