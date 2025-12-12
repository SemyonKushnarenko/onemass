import { Injectable } from '@nestjs/common';
import { AuthDataValidator } from './auth.validator';

@Injectable()
export class AuthService {
  private readonly _validator: AuthDataValidator;

  constructor() {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken && process.env.TELEGRAM_CHECK_SIGNATURE !== 'false') {
      throw new Error('BOT_TOKEN is required when signature check is enabled');
    }
    this._validator = new AuthDataValidator({
      botToken: botToken ?? '',
    });
  }

  get validator(): Readonly<AuthDataValidator> {
    return Object.freeze(this._validator);
  }

  getQueryMap(query: string): Map<string, string> {
    return new Map(new URLSearchParams(query).entries());
  }
}
