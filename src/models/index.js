const Sequelize = require('sequelize');

const { postgres } = require('~/config/index');

const getUserModel = require('~/models/users.model');
const getSessionModel = require('~/models/session.model');
const getNotesModel = require('~/models/notes.model');
const getVerifyCode = require('~/models/verifycodes.model');

const sequelize = new Sequelize(
  postgres.db,
  postgres.username,
  postgres.password,
  postgres.options,
);

const models = {
  User: getUserModel(sequelize, Sequelize),
  Session: getSessionModel(sequelize, Sequelize),
  Notes: getNotesModel(sequelize, Sequelize),
  VerifyCode: getVerifyCode(sequelize, Sequelize),
};

module.exports = { sequelize, ...models };
