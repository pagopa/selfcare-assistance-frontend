const getEnvVar = (key: string, required = true): string => {
  const value = import.meta.env[key];
  if (required && !value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value || '';
};

const getEnvBool = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key];
  return value ? value === 'true' : defaultValue;
};

const getEnvInt = (key: string): number => parseInt(getEnvVar(key), 10);

export const ENV = {
  ENV: getEnvVar('VITE_ENV'),
  PUBLIC_URL: '/assistenza',

  ASSISTANCE: {
    ENABLE: getEnvBool('VITE_ENABLE_ASSISTANCE'),
    EMAIL: getEnvVar('VITE_PAGOPA_HELP_EMAIL'),
  },

  URL_FILE: {
    PRIVACY_POLICY: 'https://www.pagopa.it/it/privacy-policy-assistenza/',
  },

  URL_FE: {
    LOGIN: getEnvVar('VITE_URL_FE_LOGIN'),
    LOGOUT: getEnvVar('VITE_URL_FE_LOGOUT'),
    DASHBOARD: getEnvVar('VITE_URL_FE_DASHBOARD'),
    LANDING: getEnvVar('VITE_URL_FE_LANDING'),
  },

  URL_API: {
    API_DASHBOARD: getEnvVar('VITE_URL_API_DASHBOARD'),
  },

  API_TIMEOUT_MS: {
    ASSISTANCE: getEnvInt('VITE_API_DASHBOARD_TIMEOUT_MS'),
  },

  ANALYTCS: {
    ENABLE: getEnvBool('VITE_ANALYTICS_ENABLE'),
    MOCK: getEnvBool('VITE_ANALYTICS_MOCK'),
    DEBUG: getEnvBool('VITE_ANALYTICS_DEBUG'),
    TOKEN: getEnvVar('VITE_MIXPANEL_TOKEN'),
    API_HOST: import.meta.env.VITE_MIXPANEL_API_HOST || 'https://api-eu.mixpanel.com',
  },
};
