import { User } from './User';

/** Signed-in user and the token proving it to the API, as returned by login. */
export interface Session {
  user: User;
  token: string;
}
