declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // common
      NODE_ENV: 'development' | 'production';
      PORT: string;
      HOST: string;

      // DB
      DB_NAME: string;
      DB_PASSWORD: string;
      DB_USERNAME: string;
      DB_DIALECT: string;
      DB_HOST: string;
      DB_PORT: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
