import { User } from '../../entities';

export interface LogInResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
}
