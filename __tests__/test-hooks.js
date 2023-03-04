require('module-alias/register');

const { suiteSetup } = require('mocha');
const dotenv = require('dotenv');

process.env.DEBUG = '';
process.env.NODE_ENV = 'test';

dotenv.config({
  path: './.env/.common.env',
});

dotenv.config({
  path: './.env/.test.env',
});

const { sequelize } = require('~/models/index');


suiteSetup(async () => {
  await sequelize.sync();
});
