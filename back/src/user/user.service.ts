import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { TelegramUserData } from 'src/auth/auth.types';
import { UserCreatedVia, UserRole } from './user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  getHello(): string {
    Logger.log('[UserService] [getHello] hello world');
    return 'Hello World!';
  }

  async getByTelegramId(telegramId: bigint | string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { telegramId: telegramId.toString() },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async getOrCreateUser(telegramData: TelegramUserData): Promise<User> {
    let user: User | null = await this.getByTelegramId(telegramData.id);

    Logger.warn(`[UserService][getOrCreateUser] cool`);
    const userData = {
      telegramId: telegramData.id.toString(),
      username: telegramData.username,
      firstName: telegramData.first_name,
      createdVia: UserCreatedVia.OTHER,
      role: this.resolveRole(telegramData.id),
    } as Partial<User>;

    if (!user) {
      try {
        user = this.userRepository.create(userData);
        await this.userRepository.save(user);
      } catch (err) {
        if (
          err instanceof QueryFailedError &&
          err.message.includes('duplicate key')
        ) {
          Logger.warn(
            `[UserService][getOrCreateUser][${userData.telegramId}] Duplicate key error while creating user`,
          );
        } else {
          throw err;
        }
      }
    } else {
      const diff = Object.keys(userData).filter(
        (key) => userData[key] !== user?.[key],
      );
      if (diff.length > 0) {
        await this.userRepository.update(
          { telegramId: telegramData.id },
          userData,
        );
      }
    }
    //@ts-expect-error
    return user;
  }

  resolveRole(telegramId: number): UserRole {
    const whitelist = process.env.PSYCHOLOGIST_IDS?.split(',').filter(Boolean);
    if (whitelist && whitelist.includes(telegramId.toString())) {
      return UserRole.PSYCHOLOGIST;
    }
    return UserRole.PATIENT;
  }

  async getPatientsWithTelegram(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.PATIENT },
    });
  }
}
