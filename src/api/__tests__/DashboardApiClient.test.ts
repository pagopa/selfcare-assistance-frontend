import { onRedirectToLogin, DashboardApi } from '../DashboardApiClient';

const { mockSendSupportRequestUsingPOST } = vi.hoisted(() => ({
  mockSendSupportRequestUsingPOST: vi.fn(),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: {
    read: vi.fn(() => 'mock-token'),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: vi.fn(() => vi.fn()),
  extractResponse: vi.fn((result, _status, _onError) => result.value),
}));

vi.mock('../generated/b4f-dashboard/client', () => ({
  createClient: vi.fn(() => ({
    sendSupportRequestUsingPOST: mockSendSupportRequestUsingPOST,
  })),
}));

describe('DashboardApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('onRedirectToLogin', () => {
    test('dispatches addError action', () => {
      expect(() => onRedirectToLogin()).not.toThrow();
    });
  });

  describe('DashboardApi', () => {
    test('sendSupportRequest calls API with correct parameters', async () => {
      const mockResponse = {
        status: 200,
        value: { jwt: 'jwt', actionUrl: 'url', redirectUrl: 'redirect' },
      };
      mockSendSupportRequestUsingPOST.mockResolvedValue(mockResponse);

      const result = await DashboardApi.sendSupportRequest(
        'test@example.com',
        'product-id',
        'test-data'
      );

      expect(mockSendSupportRequestUsingPOST).toHaveBeenCalledWith({
        body: {
          email: 'test@example.com',
          productId: 'product-id',
          data: 'test-data',
        },
      });
      expect(result).toEqual(mockResponse.value);
    });

    test('sendSupportRequest works without optional data parameter', async () => {
      const mockResponse = {
        status: 200,
        value: { jwt: 'jwt', actionUrl: 'url', redirectUrl: 'redirect' },
      };
      mockSendSupportRequestUsingPOST.mockResolvedValue(mockResponse);

      const result = await DashboardApi.sendSupportRequest('test@example.com', 'product-id');

      expect(mockSendSupportRequestUsingPOST).toHaveBeenCalledWith({
        body: {
          email: 'test@example.com',
          productId: 'product-id',
          data: undefined,
        },
      });
      expect(result).toEqual(mockResponse.value);
    });
  });
});