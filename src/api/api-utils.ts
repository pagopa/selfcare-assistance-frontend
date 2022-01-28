import { ApiRequestType, IResponseType, TypeofApiResponse } from '@pagopa/ts-commons/lib/requests';
import { isRight, toError } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { agent } from '@pagopa/ts-commons';
import { AbortableFetch, setFetchTimeout, toFetch } from '@pagopa/ts-commons/lib/fetch';
import { Millisecond } from '@pagopa/ts-commons/lib/units';
import { ENV } from '../utils/env';

export const buildFetchApi = (timeoutMs: number = 300000): typeof fetchWithTimeout => {
  // Must be an https endpoint so we use an https agent
  const abortableFetch = AbortableFetch(agent.getHttpFetch(process.env));
  const fetchWithTimeout = toFetch(setFetchTimeout(timeoutMs as Millisecond, abortableFetch));
  // tslint:disable-next-line: no-any
  return fetch as any as typeof fetchWithTimeout;
};

export const extractResponse = async <R>(
  response: t.Validation<
    TypeofApiResponse<ApiRequestType<any, any, any, IResponseType<any, any, any>>>
  >,
  successHttpStatus: number,
  onRedirectToLogin: () => void,
  notValidTokenHttpStatus: number | null = 401,
  notAuthorizedTokenHttpStatus: number | null = 403
): Promise<R> => {
  if (isRight(response)) {
    if (response.right.status === successHttpStatus) {
      return response.right.value;
    } else if (notValidTokenHttpStatus && response.right.status === notValidTokenHttpStatus) {
      onRedirectToLogin();
      window.setTimeout(() => window.location.assign(ENV.URL_FE.LOGOUT), 2000);
      return new Promise(() => null);
    } else if (
      notAuthorizedTokenHttpStatus &&
      response.right.status === notAuthorizedTokenHttpStatus
    ) {
      throw new Error(`Operation not allowed!`);
    } else {
      console.error(JSON.stringify(response.right));
      throw new Error(
        `Unexpected HTTP status! Expected ${successHttpStatus} obtained ${response.right.status}`
      );
    }
  } else {
    console.error('Something gone wrong while fetching data');
    console.error(JSON.stringify(response.left));
    throw toError(response.left);
  }
};
