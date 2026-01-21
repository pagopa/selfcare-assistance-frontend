import { AssistanceRequest } from '../../pages/Assistance/Assistance';
import { sendRequestToSupport } from '../assistanceService';
import { DashboardApi } from '../../api/DashboardApiClient';

vi.mock('../../api/DashboardApiClient', () => ({
  DashboardApi: {
    sendSupportRequest: vi.fn(),
  },
}));

describe('assistanceService', () => {
  test('Test assistanceRequest2CreateMessageDto', () => {
    const assistanceRequest: AssistanceRequest = {
      email: 'test@test.it',
      confirmEmail: 'test@test.it',
    };
    expect(assistanceRequest).toStrictEqual({
      email: 'test@test.it',
      confirmEmail: 'test@test.it',
    });
  });

  test('sendRequestToSupport calls DashboardApi', async () => {
    const mockResponse = { jwt: 'jwt', actionUrl: 'url', redirectUrl: 'redirect' };
    vi.mocked(DashboardApi.sendSupportRequest).mockResolvedValue(mockResponse);

    const result = await sendRequestToSupport('test@test.it', 'product-id', 'data');

    expect(DashboardApi.sendSupportRequest).toHaveBeenCalledWith('test@test.it', 'product-id', 'data');
    expect(result).toEqual(mockResponse);
  });
});
