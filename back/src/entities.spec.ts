import 'reflect-metadata';
import { validate } from 'class-validator';
import { User } from './user/user.entity';
import { UserCreatedVia, UserRole } from './user/user.types';
import { Mood } from './mood/mood.entity';
import { Psychologist } from './psychologist/psychologist.entity';
import { PsychologistPatient } from './psychologist/psychologist-patient.entity';
import { Referral, ReferralStatus } from './psychologist/referral.entity';
import {
  NotificationLog,
  NotificationType,
} from './notification/notification-log.entity';

describe('Entity validation', () => {
  it('rejects user with invalid role', async () => {
    const user = new User();
    user.id = '00000000-0000-0000-0000-000000000001';
    user.createdVia = UserCreatedVia.STARS;
    // @ts-expect-error force invalid enum
    user.role = 'invalid';

    const errors = await validate(user);
    expect(errors.find((e) => e.property === 'role')).toBeDefined();
  });

  it('accepts user with valid enums and optional fields omitted', async () => {
    const user = new User();
    user.id = '00000000-0000-0000-0000-000000000002';
    user.createdVia = UserCreatedVia.OTHER;
    user.role = UserRole.PATIENT;

    const errors = await validate(user);
    expect(errors.length).toBe(0);
  });

  it('rejects mood outside 1-5 range', async () => {
    const mood = new Mood();
    mood.id = '00000000-0000-0000-0000-000000000003';
    mood.value = 6;
    mood.date = new Date();

    const errors = await validate(mood);
    expect(errors.find((e) => e.property === 'value')).toBeDefined();
  });

  it('requires id on psychologist patient link', async () => {
    const link = new PsychologistPatient();
    const errors = await validate(link);

    expect(errors.find((e) => e.property === 'id')).toBeDefined();
  });

  it('rejects referral with invalid status', async () => {
    const referral = new Referral();
    referral.id = '00000000-0000-0000-0000-000000000004';
    referral.refCode = 'ABC123';
    referral.status = 'wrong' as ReferralStatus;

    const errors = await validate(referral);
    expect(errors.find((e) => e.property === 'status')).toBeDefined();
  });

  it('rejects notification log with invalid type', async () => {
    const notification = new NotificationLog();
    notification.id = '00000000-0000-0000-0000-000000000005';
    notification.type = 'something_else' as NotificationType;

    const errors = await validate(notification);
    expect(errors.find((e) => e.property === 'type')).toBeDefined();
  });
});

