import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined = env.get('PUBLIC_URL').asString();
export const ENV = {
  PUBLIC_URL: PUBLIC_URL_INNER ? PUBLIC_URL_INNER : '/assistenza',

  ASSISTANCE: {
    ENABLE: env.get('REACT_APP_ENABLE_ASSISTANCE').required().asBool(),
    EMAIL: env.get('REACT_APP_PAGOPA_HELP_EMAIL').required().asString(),
  },

  URL_FE: {
    LOGIN: env.get('REACT_APP_URL_FE_LOGIN').required().asString(),
    LOGOUT: env.get('REACT_APP_URL_FE_LOGOUT').required().asString(),
    DASHBOARD: env.get('REACT_APP_URL_FE_DASHBOARD').required().asString(),
    LANDING: env.get('REACT_APP_URL_FE_LANDING').required().asString(),
  },

  URL_API: {
    API_ASSISTANCE: env.get('REACT_APP_URL_API_ASSISTANCE').required().asString(),
  },

  API_TIMEOUT_MS: {
    ASSISTANCE: env.get('REACT_APP_API_ASSISTANCE_TIMEOUT_MS').required().asInt(),
  },

};
