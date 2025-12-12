import { MoodService } from './mood.service';
import { Repository } from 'typeorm';
import { Mood } from './mood.entity';
import { User } from 'src/user/user.entity';

const repoMock = () =>
  ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  }) as unknown as Repository<Mood>;

const user = { id: 'u1' } as User;

describe('MoodService', () => {
  it('submits mood with default date', async () => {
    const repo = repoMock();
    (repo.create as any).mockImplementation((data) => data);
    (repo.save as any).mockImplementation((data) => data);
    const service = new MoodService(repo);

    const mood = await service.submitMood({ user, value: 4 });
    expect(mood.value).toBe(4);
    expect(mood.user).toBe(user);
    expect(repo.save).toHaveBeenCalled();
  });

  it('lists moods with default range', async () => {
    const repo = repoMock();
    (repo.find as any).mockResolvedValue([]);
    const service = new MoodService(repo);
    const result = await service.listByUser({ user });
    expect(Array.isArray(result)).toBe(true);
    expect(repo.find).toHaveBeenCalled();
  });

  it('calculates stats averages', async () => {
    const repo = repoMock();
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ avg: '3.5' }),
    };
    (repo.createQueryBuilder as any).mockReturnValue(qb);
    const service = new MoodService(repo);
    const stats = await service.stats({ user });
    expect(stats.avgMonth).toBeCloseTo(3.5);
    expect(stats.avgYear).toBeCloseTo(3.5);
  });
});

