import { AuthDataValidator } from './auth.validator';

describe('AuthDataValidator', () => {
  it('returns null for invalid auth_date', () => {
    const validator = new AuthDataValidator({ botToken: 'token' });
    const map = new Map<string, string>([
      ['auth_date', 'not-a-number'],
      ['hash', 'hash'],
    ]);
    const result = validator.validate(map as any);
    expect(result).toBeNull();
  });
});

