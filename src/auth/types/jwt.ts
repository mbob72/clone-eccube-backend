export interface IJwtPayload {
  aud: string;
  iss: string;
  iat: number;
  guest: boolean;
  userId: string;
}
