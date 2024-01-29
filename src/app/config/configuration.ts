export default () => ({
  // common
  host: process.env.HOST || 'localhost',
  port: parseInt(process.env.PORT, 10) || 3000,
  // i18n
  fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
  // auth
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  salt: process.env.SALT || 10,
  // cookie (auth)
  cookieName: process.env.COOKIE_NAME || 'token',
  cookieDomain: process.env.COOKIE_DOMAIN,
  allowNoSameSite: !!process.env.ALLOW_NO_SAME_SITE,
  // Mollie
  mollie: {
    clientId: process.env.MOLLIE_CLIENT_ID || 'clientId',
    clientSecret: process.env.MOLLIE_CLIENT_SECRET || 'secret',
    authHost: process.env.MOLLIE_AUTH_HOST || 'https://my.mollie.com',
    tokenHost: process.env.MOLLIE_TOKEN_HOST || 'https://api.mollie.com',
  },
  // DB
  database: {
    name: process.env.DB_NAME || '',
    password: process.env.DB_PASSWORD || '',
    username: process.env.DB_USERNAME || 'user',
    type: process.env.DB_DIALECT || ('postgres' as const),
    host: process.env.DB_HOST || 'url',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
  },
});
