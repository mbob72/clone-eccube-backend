export default () => ({
  host: process.env.HOST || 'localhost',
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    name: process.env.DB_NAME || '',
    password: process.env.DB_PASSWORD || '',
    username: process.env.DB_USERNAME || 'user',
    type: process.env.DB_DIALECT || ('postgres' as const),
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_DIALECT, 10) || 5432,
  },
});
