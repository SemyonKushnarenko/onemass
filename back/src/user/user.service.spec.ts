import { UserService } from './user.service';
import { User, } from './user.entity';
import { Repository } from 'typeorm';
import { UserCreatedVia, UserRole } from './user.types';

const mockRepo = () =>
  ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  }) as unknown as Repository<User>;

const telegramData = {
  id: 1,
  username: 'john',
  first_name: 'John',
};

describe('UserService', () => {
  it('creates user with resolved role', async () => {
    const repo = mockRepo();
    (repo.findOne as any).mockResolvedValue(null);
    const created = {} as User;
    (repo.create as any).mockReturnValue(created);
    (repo.save as any).mockResolvedValue(created);

    const service = new UserService(repo);
    process.env.PSYCHOLOGIST_IDS = '2,3';
    const result = await service.getOrCreateUser(telegramData as any);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRole.PATIENT,
        createdVia: UserCreatedVia.OTHER,
      }),
    );
    expect(result).toBe(created);
  });

  it('resolves psychologist role from whitelist', () => {
    const service = new UserService(mockRepo());
    process.env.PSYCHOLOGIST_IDS = '1,2';
    const role = service.resolveRole(1);
    expect(role).toBe(UserRole.PSYCHOLOGIST);
  });
});

