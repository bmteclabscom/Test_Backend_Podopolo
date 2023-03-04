require('module-alias/register');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('~/routes/index');
const log = require('debug')('app:main');
const { sequelize } = require('~/models/index');
const {
  cors: corsConfig,
  morgan: { enable: isLogging },
} = require('~/config/index');

exports.start = async () => {
  const app = express();

  app.set('view engine', 'html');
  if (corsConfig.enabled) {
    log('cors enabled', corsConfig.options);
    app.use(cors(corsConfig.options));
  }

  if (isLogging) {
    log('configure logging');
    app.use(morgan('dev'));
  }
  log('set the public folder');
  app.use(express.static('public'));

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(routes);
  app.get('/*', (req, res) =>
    res.status(404).json({ success: false, message: "API Doesn't Exist" }),
  );

  await sequelize.sync();
  return app;
};
