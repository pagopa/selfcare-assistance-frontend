import { DashboardApi } from '../api/DashboardApiClient';

export const sendRequestToSupport = async (email: string, productId: string): Promise<string> => {
  /* istanbul ignore if */
  if (process.env.REACT_APP_API_MOCK_ASSISTANCE === 'true') {
    return new Promise((resolve) => resolve('mockedUrl'));
  } else {
    return DashboardApi.sendSupportRequest(email, productId);
  }
};
