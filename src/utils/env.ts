import * as env from 'env-var';

const PUBLIC_URL_INNER: string | undefined = env.get('PUBLIC_URL').asString();
export const ENV = {
  ENV: env.get('REACT_APP_ENV').required().asString(),
  PUBLIC_URL: PUBLIC_URL_INNER ? PUBLIC_URL_INNER : '/assistenza',

  ASSISTANCE: {
    ENABLE: env.get('REACT_APP_ENABLE_ASSISTANCE').required().asBool(),
    EMAIL: env.get('REACT_APP_PAGOPA_HELP_EMAIL').required().asString(),
  },

  URL_FILE: {
    PRIVACY_POLICY: 'https://www.pagopa.it/it/privacy-policy-assistenza/',
  },

  URL_FE: {
    LOGIN: env.get('REACT_APP_URL_FE_LOGIN').required().asString(),
    LOGOUT: env.get('REACT_APP_URL_FE_LOGOUT').required().asString(),
    DASHBOARD: env.get('REACT_APP_URL_FE_DASHBOARD').required().asString(),
    LANDING: env.get('REACT_APP_URL_FE_LANDING').required().asString(),
  },

  URL_API: {
    API_DASHBOARD: env.get('REACT_APP_URL_API_DASHBOARD').required().asString(),
  },

  API_TIMEOUT_MS: {
    ASSISTANCE: env.get('REACT_APP_API_DASHBOARD_TIMEOUT_MS').required().asInt(),
  },

  ANALYTCS: {
    ENABLE: env.get('REACT_APP_ANALYTICS_ENABLE').default('false').asBool(),
    MOCK: env.get('REACT_APP_ANALYTICS_MOCK').default('false').asBool(),
    DEBUG: env.get('REACT_APP_ANALYTICS_DEBUG').default('false').asBool(),
    TOKEN: env.get('REACT_APP_MIXPANEL_TOKEN').required().asString(),
    API_HOST: env
      .get('REACT_APP_MIXPANEL_API_HOST')
      .default('https://api-eu.mixpanel.com')
      .asString(),
  },
};
