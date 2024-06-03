import { ErrorBoundary, LoadingOverlay } from '@pagopa/selfcare-common-frontend';
import UnloadEventHandler from '@pagopa/selfcare-common-frontend/components/UnloadEventHandler';
import { storageTokenOps, isExpiredToken } from '@pagopa/selfcare-common-frontend/utils/storage';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Assistance from './pages/Assistance/Assistance';
import { onRedirectToLogin } from './api/DashboardApiClient';
import { ENV } from './utils/env';

const App = () => {
  useEffect(() => {
    const token = storageTokenOps.read();
    if (token) {
      const isExpiredSession = isExpiredToken(token);
      if (isExpiredSession) {
        onRedirectToLogin();
        window.setTimeout(() => window.location.assign(ENV.URL_FE.LOGOUT), 2000);
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <Layout>
        <LoadingOverlay />
        <UnloadEventHandler />
        <Assistance />
      </Layout>
    </ErrorBoundary>
  );
};

export default App;
