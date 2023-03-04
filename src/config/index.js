const { readFileSync } = require('node:fs');

const { get } = require('./tools');

const jwtCerts = [
  {
    name: 'Public Key',
    key: 'publicKey',
    envVar: 'JWT_PUBLIC_KEY',
  },
  {
    name: 'Private Key',
    key: 'privateKey',
    envVar: 'JWT_PRIVATE_KEY',
  },
].reduce((prev, curr) => {
  const path = get(curr.envVar);

  if (path.startsWith('-----BEGIN')) {
    return { ...prev, [curr.key]: path };
  }

  try {
    const content = readFileSync(path, { encoding: 'utf-8' });
    return { ...prev, [curr.key]: content };
  } catch (e) {
    console.warn('Cannot find the "%s". please check the "%s" file', curr.name, path);
  }

  return prev;
}, {});

module.exports = {
  port: get('PORT'),
  host: get('HOST'),
  publicUrl: get('PUBLIC_URL'),
  apiPrefix: get('API_PREFIX'),
  apiExcludes: get('API_EXCLUDES'),
  morgan: {
    enable: get('MORGAN_ENABLE'),
  },
  security: {
    code: {
      min: 10 ** (get('SECURITY_CODE_LENGTH') - 1),
      max: 10 ** get('SECURITY_CODE_LENGTH') - 1,
      delay: get('SECURITY_CODE_DELAY'),
      tryDelay: get('SECURITY_TRY_DELAY'),
      ttl: get('SECURITY_CODE_TTL'),
      maxTries: get('SECURITY_MAX_TRIES'),
      maxSends: get('SECURITY_MAX_SENDS'),
    },
    recaptcha: {
      enabled: get('RECAPTCHA_ENABLED'),
      secretKey: get('RECAPTCHA_SECRET_KEY'),
      score: get('RECAPTCHA_MIN_SCORE'),
    },
  },
  cors: {
    enabled: get('CORS_ENABLED'),
    /**
     * @type {import('cors').CorsOptionsDelegate}
     */
    options: (req, done) => {
      const value = get('CORS_ORIGIN');
      const origin = req.get('origin');

      if (value === '*') return done(null, { origin: '*' });

      if (!origin) return done(null, { origin: false });

      const whitelist = value.split(',');
      const found = whitelist.find((o) => origin.startsWith(o));
      return done(null, { origin: !!found });
    },
  },
  postgres: {
    db: get('POSTGRES_DB'),
    username: get('POSTGRES_USER'),
    password: get('POSTGRES_PASSWORD'),
    /**
     * @type {import('sequelize').Options}
     */
    options: {
      host: get('POSTGRES_HOST'),
      port: get('POSTGRES_PORT'),
      logging: get('POSTGRES_LOGGING'),
      dialect: 'postgres',
      operatorAliases: false,
      pool: {
        max: get('POSTGRES_POOL_MAX'),
        min: get('POSTGRES_POOL_MIN'),
        acquire: get('POSTGRES_POOL_ACQUIRE'),
        idle: get('POSTGRES_POOL_IDLE'),
      },
      dialectOptions: get('POSTGRES_SSL')
        ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
        : undefined,
    },
  },
  sendGrid: {
    apiKey: get('SENDGRID_API_KEY'),
    from: get('SENDGRID_FROM'),
  },
  jwt: {
    ...jwtCerts,
    aud: get('JWT_AUDIENCE').split(','),
    iss: get('JWT_ISSUER'),
    exp: get('JWT_EXPIRATION'),
  },
};
