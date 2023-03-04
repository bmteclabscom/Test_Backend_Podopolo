const log = require('debug')('app:index');
const { port: PORT, host: HOST, publicUrl, apiPrefix, postgres } = require('./config/index');
const { start } = require('./lib/app');

(async () => {
  const app = await start();
  app.listen(PORT, HOST, () => {
    log(
      'POSTGRES          : postgres://%s:%s@%s:%d/%s',
      postgres.username,
      postgres.password,
      postgres.options.host,
      postgres.options.port,
      postgres.db,
    );
    log('Server started at : %s%s', publicUrl, apiPrefix);
  });
})();
