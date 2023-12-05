const CREDENTIALS_LIFETIME = 60 * 60 * 24 * 7; // 7 days in seconds
const RESET_PASSWORD_LIFETIME = 60 * 60; // 1 hour in seconds
// const EXTRADITION_FILE_SIGN_LIFETIME = 5 * 60; // 5 minutes in seconds

export const JwtConstants = {
  issuer: 'eccube',
  credentialsLifetime: CREDENTIALS_LIFETIME,
  resetPasswordLifetime: RESET_PASSWORD_LIFETIME,
};
