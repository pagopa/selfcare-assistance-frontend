import { storageRead } from '@pagopa/selfcare-common-frontend/utils/storage-utils';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import { buildFetchApi, extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import { STORAGE_KEY_TOKEN } from '../utils/constants';
import { store } from '../redux/store';
import { ENV } from '../utils/env';
import { createClient, WithDefaultsT } from './generated/notification-manager/client';
import { CreateMessageDto } from './generated/notification-manager/CreateMessageDto';

const withBearer: WithDefaultsT<'bearerAuth'> = (wrappedOperation) => (params: any) => {
  const token = storageRead(STORAGE_KEY_TOKEN, 'string');
  return wrappedOperation({
    ...params,
    bearerAuth: `Bearer ${token}`,
  });
};

const apiClient = createClient({
  baseUrl: ENV.URL_API.API_ASSISTANCE,
  basePath: '',
  fetchApi: buildFetchApi(ENV.API_TIMEOUT_MS.ASSISTANCE),
  withDefaults: withBearer,
});

const onRedirectToLogin = () =>
  store.dispatch(
    appStateActions.addError({
      id: 'tokenNotValid',
      error: new Error(),
      techDescription: 'token expired or not valid',
      toNotify: false,
      blocking: false,
      displayableTitle: 'Sessione scaduta',
      displayableDescription: 'Stai per essere rediretto alla pagina di login...',
    })
  );

export const NotificationManagerApi = {
  save: async (entity: CreateMessageDto): Promise<void> => {
    const result = await apiClient.sendNotificationToCustomerCareUsingPOST({
      body: entity,
    });
    return extractResponse(result, 204, onRedirectToLogin);
  },
};
