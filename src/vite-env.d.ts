/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_URL_CDN: string;
  readonly VITE_URL_FE_LOGIN: string;
  readonly VITE_URL_FE_LOGOUT: string;
  readonly VITE_URL_FE_DASHBOARD: string;
  readonly VITE_URL_FE_LANDING: string;
  readonly VITE_URL_API_DASHBOARD: string;
  readonly VITE_API_MOCK_ASSISTANCE: string;
  readonly VITE_ENABLE_ASSISTANCE: string;
  readonly VITE_PAGOPA_HELP_EMAIL: string;
  readonly VITE_API_DASHBOARD_TIMEOUT_MS: string;
  readonly VITE_ONE_TRUST_BASE_URL: string;
  readonly VITE_ONETRUST_DOMAIN_ID: string;
  readonly VITE_ANALYTICS_ENABLE: string;
  readonly VITE_ANALYTICS_MOCK: string;
  readonly VITE_ANALYTICS_DEBUG: string;
  readonly VITE_MIXPANEL_TOKEN: string;
  readonly VITE_MIXPANEL_API_HOST?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
