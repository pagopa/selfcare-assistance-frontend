import { DashboardApi } from '../api/DashboardApiClient';
import { SupportResponse } from '../api/generated/b4f-dashboard/SupportResponse';

export const sendRequestToSupport = async (
  email: string,
  productId: string
): Promise<SupportResponse> => {
  /* istanbul ignore if */
  if (process.env.REACT_APP_API_MOCK_ASSISTANCE === 'true') {
    return new Promise((resolve) => resolve({ redirectUrl: 'mockedUrl' }));
  } else {
    return DashboardApi.sendSupportRequest(email, productId);
  }
};
