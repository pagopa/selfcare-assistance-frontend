import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { appStateActions } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { buildFetchApi, extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { EmailString } from '@pagopa/ts-commons/lib/strings';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { createClient, WithDefaultsT } from './generated/b4f-dashboard/client';
import { SupportResponse } from './generated/b4f-dashboard/SupportResponse';

const withBearer: WithDefaultsT<'bearerAuth'> = (wrappedOperation) => (params: any) => {
  const token = storageTokenOps.read();
  return wrappedOperation({
    ...params,
    bearerAuth: `Bearer ${token}`,
  });
};

const apiClient = createClient({
  baseUrl: ENV.URL_API.API_DASHBOARD,
  basePath: '',
  fetchApi: buildFetchApi(ENV.API_TIMEOUT_MS.ASSISTANCE),
  withDefaults: withBearer,
});

export const onRedirectToLogin = () =>
  store.dispatch(
    appStateActions.addError({
      id: 'tokenNotValid',
      error: new Error(),
      techDescription: 'token expired or not valid',
      toNotify: false,
      blocking: false,
      displayableTitle: i18n.t('session.expired.title'),
      displayableDescription: i18n.t('session.expired.message'),
    })
  );

export const DashboardApi = {
  sendSupportRequest: async (email: string, productId: string): Promise<SupportResponse> => {
    const result = await apiClient.sendSupportRequestUsingPOST({
      body: {
        email: email as EmailString,
        productId,
      },
    });
    return extractResponse(result, 200, onRedirectToLogin);
  },
};
