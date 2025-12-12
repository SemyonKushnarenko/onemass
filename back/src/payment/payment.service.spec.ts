import { PaymentPurpose, PaymentStatus } from './payment.entity';
import { PaymentService } from './payment.service';
import { User } from 'src/user/user.entity';

describe('PaymentService', () => {
  const save = jest.fn();
  const create = jest.fn();
  const findOne = jest.fn();
  const repositoryMock = {
    save,
    create,
    findOne,
  } as any;
  const referralRepoMock = {
    findOne: jest.fn(),
    save: jest.fn(),
  } as any;
  const userRepoMock = {
    save: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    referralRepoMock.findOne.mockReset();
    referralRepoMock.save.mockReset();
    userRepoMock.save.mockReset();
  });

  it('creates payment record with pending status', async () => {
    const payment = { id: '1' };
    create.mockReturnValue(payment);
    save.mockResolvedValue(payment);

    const service = new PaymentService(
      repositoryMock,
      referralRepoMock,
      userRepoMock,
    );
    const result = await service.createPaymentRecord({
      amountStars: 100,
      purpose: PaymentPurpose.PATIENT_SUBSCRIPTION,
      payload: 'payload',
    });

    expect(create).toHaveBeenCalledWith({
      amountStars: 100,
      purpose: PaymentPurpose.PATIENT_SUBSCRIPTION,
      payload: 'payload',
      status: PaymentStatus.PENDING,
    });
    expect(save).toHaveBeenCalledWith(payment);
    expect(result).toEqual(payment);
  });

  it('marks payment as paid by payload', async () => {
    const payment = { payload: 'abc', status: PaymentStatus.PENDING };
    findOne.mockResolvedValue(payment);
    save.mockResolvedValue(payment);
    const service = new PaymentService(
      repositoryMock,
      referralRepoMock,
      userRepoMock,
    );

    await service.markPaid('abc');

    expect(payment.status).toBe(PaymentStatus.PAID);
    expect(save).toHaveBeenCalledWith(payment);
  });

  it('activates subscription on paid', async () => {
    const user = { subscriptionActive: false } as User;
    const payment = {
      payload: 'p',
      status: PaymentStatus.PENDING,
      purpose: PaymentPurpose.PATIENT_SUBSCRIPTION,
      user,
    };
    findOne.mockResolvedValue(payment);
    save.mockResolvedValue(payment);
    const service = new PaymentService(
      repositoryMock,
      referralRepoMock,
      userRepoMock,
    );

    await service.markPaid('p');

    expect(user.subscriptionActive).toBe(true);
    expect(userRepoMock.save).toHaveBeenCalledWith(user);
  });

  it('activates referral on paid payload=refCode', async () => {
    const payment = {
      payload: 'ref123',
      status: PaymentStatus.PENDING,
      purpose: PaymentPurpose.ADD_PATIENT,
    };
    findOne.mockResolvedValue(payment);
    referralRepoMock.findOne.mockResolvedValue({ refCode: 'ref123' });
    const service = new PaymentService(
      repositoryMock,
      referralRepoMock,
      userRepoMock,
    );

    await service.markPaid('ref123');

    expect(referralRepoMock.save).toHaveBeenCalled();
  });

  it('creates invoice link via Telegram API', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ ok: true, result: 'invoice_url' }),
    } as any);
    process.env.BOT_TOKEN = 'token';
    const service = new PaymentService(
      repositoryMock,
      referralRepoMock,
      userRepoMock,
    );

    const url = await service.createInvoiceLink({
      amountStars: 100,
      title: 'Title',
      description: 'Desc',
      payload: 'payload',
    });

    expect(url).toBe('invoice_url');
    expect(global.fetch).toHaveBeenCalled();
  });
});

