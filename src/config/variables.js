/** @type {{[key: string]: { log?: boolean; name: string; defaultValue?: string; group?: string, type?: 'boolean' | 'string' | 'number' } }} */
module.exports = {
  /**
   * App
   */
  PORT: {
    name: 'Port',
    defaultValue: 3000,
  },
  HOST: {
    name: 'Host',
    defaultValue: '0.0.0.0',
  },
  API_EXCLUDES: {
    name: 'Enable API Excludes',
    defaultValue: true,
    type: 'boolean',
  },
  CORS_ENABLED: {
    name: 'Enabled',
    group: 'CORS',
    defaultValue: false,
    type: 'boolean',
  },
  CORS_ORIGIN: {
    name: 'Origin',
    log: false,
    group: 'CORS',
    defaultValue: '*',
  },
  PUBLIC_URL: {
    name: 'Public URL',
    defaultValue: `http://localhost:${process.env.PORT || 3000}`,
  },
  MORGAN_ENABLE: {
    name: 'Enable Morgan logging',
    defaultValue: false,
    type: 'boolean',
  },
  API_PREFIX: {
    name: 'API Prefix',
    log: false,
    defaultValue: '/api',
  },
  SECURITY_CODE_LENGTH: {
    name: 'Code Length',
    group: 'Security',
    defaultValue: 6,
    type: 'number',
  },
  SECURITY_CODE_DELAY: {
    name: 'Verification Delay',
    group: 'Security',
    defaultValue: 30000, // 30s
    type: 'number',
  },
  SECURITY_TRY_DELAY: {
    name: 'Retry Delay',
    group: 'Security',
    defaultValue: 5000, // 5s
    type: 'number',
  },
  SECURITY_CODE_TTL: {
    name: 'Verification Delay',
    group: 'Security',
    defaultValue: 7200000, // 2h
    type: 'number',
  },
  SECURITY_MAX_TRIES: {
    name: 'Max Tries',
    group: 'Security',
    defaultValue: 5,
    type: 'number',
  },
  SECURITY_MAX_SENDS: {
    name: 'Max Resends',
    group: 'Security',
    defaultValue: 5,
    type: 'number',
  },
  /**
   * SendGrid
   */
  SENDGRID_API_KEY: {
    name: 'SendGrid API Key',
    log: false,
    group: 'Mailer',
  },
  SENDGRID_FROM: {
    name: 'From',
    group: 'Mailer',
    defaultValue: 'noreply@paramlabs.io',
  },
  /**
   * Postgres DB
   */
  POSTGRES_DB: {
    name: 'Database',
    group: 'Postgres',
    defaultValue: 'podopolo',
  },
  POSTGRES_HOST: {
    name: 'Host',
    group: 'Postgres',
    defaultValue: '127.0.0.1',
  },
  POSTGRES_PORT: {
    name: 'Port',
    group: 'Postgres',
    defaultValue: 5432,
  },
  POSTGRES_USER: {
    name: 'Username',
    log: false,
    group: 'Postgres',
    defaultValue: 'postgres',
  },
  POSTGRES_PASSWORD: {
    name: 'Password',
    log: false,
    group: 'Postgres',
    defaultValue: 'postgres',
  },
  POSTGRES_LOGGING: {
    name: 'Logging',
    log: false,
    group: 'Postgres',
    defaultValue: false,
    type: 'boolean',
  },
  POSTGRES_POOL_MAX: {
    name: 'Pool Max',
    log: false,
    group: 'Postgres',
    type: 'number',
    defaultValue: 5,
  },
  POSTGRES_POOL_MIN: {
    name: 'Pool Min',
    log: false,
    group: 'Postgres',
    type: 'number',
    defaultValue: 0,
  },
  POSTGRES_POOL_ACQUIRE: {
    name: 'Pool Acquire',
    log: false,
    group: 'Postgres',
    type: 'number',
    defaultValue: 30000,
  },
  POSTGRES_POOL_IDLE: {
    name: 'Pool IDLE',
    log: false,
    group: 'Postgres',
    type: 'number',
    defaultValue: 10000,
  },
  POSTGRES_SSL: {
    name: 'SSL Required',
    log: false,
    group: 'Postgres',
    type: 'boolean',
    defaultValue: false,
  },
  /**
   * JWT
   */
  JWT_ISSUER: {
    name: 'Issuer',
    log: false,
    group: 'JWT',
    defaultValue: '*',
  },
  JWT_AUDIENCE: {
    name: 'Audience',
    log: false,
    group: 'JWT',
    defaultValue: '*',
  },
  JWT_EXPIRATION: {
    name: 'Expiration',
    log: false,
    group: 'JWT',
    defaultValue: 2592000, // 30 days
    type: 'number',
  },
  JWT_PUBLIC_KEY: {
    name: 'Private Key',
    log: false,
    group: 'JWT',
    defaultValue: 'certs/es512-public.pem',
  },
  JWT_PRIVATE_KEY: {
    name: 'Private Key',
    log: false,
    group: 'JWT',
    defaultValue: 'certs/es512-private.pem',
  },
};
