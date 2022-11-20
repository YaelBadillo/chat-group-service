export const configuration = () => ({
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '12345',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRATION,
    },
  },
});
