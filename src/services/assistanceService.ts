import { DashboardApi } from '../api/DashboardApiClient';

export const sendRequestToSupport = async (email: string, productId: string): Promise<string> => {
  /* istanbul ignore if */
  if (process.env.REACT_APP_API_MOCK_ASSISTANCE === 'true') {
    return new Promise((resolve) =>
      resolve(
        '<html><head></head><body><form id="jwtForm" method="POST" action="www.mockedurl.com"><input id="jwtString" type="hidden" name="jwt" value="dummyToken"/><input id="returnTo" type="hidden" name="return_to" value="dummyUrl"/></form><script>window.onload = () => { document.forms["jwtForm"].submit(); };</script></body></html>'
      )
    );
  } else {
    return DashboardApi.sendSupportRequest(email, productId);
  }
};
