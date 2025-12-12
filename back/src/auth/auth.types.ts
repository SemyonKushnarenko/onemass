import type { Request } from 'express';
import type { User } from '../user/user.entity';

export interface TelegramUserData {
  id: bigint;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  username?: string;

  is_bot?: boolean;
  language_code?: string;
  is_premium?: boolean;
}

export interface AuthorizedRequest extends Request {
  user: User;
}

export interface LightAuthorizedRequest extends Request {
  user: TelegramUserData;
}
