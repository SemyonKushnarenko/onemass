import { Logger } from '@nestjs/common';
import type { TelegramUserData } from './auth.types';
import { createHmac } from 'node:crypto';

const EXPIRATION_TIMESTAMP = 7 * 24 * 60 * 60 * 1000;

export class AuthDataValidator {
  private botToken: string;
  constructor(options: { botToken: string }) {
    this.botToken = options.botToken;
  }

  validate(initData: Map<string, string>): TelegramUserData | null {
    if (process.env.TELEGRAM_CHECK_SIGNATURE === 'false') {
      const rawUser = initData.get('user');
      if (!rawUser) {
        Logger.error('[AuthDataValidator][validate] Missing user in initData');
        return null;
      }
      return JSON.parse(rawUser) as TelegramUserData;
    }

    const hash = initData.get('hash');
    const keys = [...initData.keys()].filter((key) => key !== 'hash').sort();
    const dataToCheck = keys.map((key) => `${key}=${initData.get(key)}`);

    const authDateTimestampSeconds = parseInt(initData.get('auth_date')!, 10);
    if (isNaN(authDateTimestampSeconds)) {
      Logger.error(
        '[AuthDataValidator][validate] Invalid auth_date',
        authDateTimestampSeconds,
      );
      return null;
    }
    const authDate = new Date(authDateTimestampSeconds * 1000);
    if (authDate < new Date(Date.now() - EXPIRATION_TIMESTAMP)) {
      Logger.error(
        '[AuthDataValidator][validate] Auth date is too old',
        authDate,
      );
      return null;
    }

    const secret = createHmac('sha256', 'WebAppData')
      .update(this.botToken)
      .digest();

    const _hash = createHmac('sha256', secret)
      .update(dataToCheck.join('\n'))
      .digest('hex');

    if (hash !== _hash) {
      Logger.error('[AuthDataValidator][validate] Invalid hash', authDate);
      return null;
    }

    return JSON.parse(initData.get('user')!) as TelegramUserData;
  }
}
