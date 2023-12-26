import { User } from 'src/users/entities/user.entity';

export interface ILoginUserResponse {
  user: User;
  backendTokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
