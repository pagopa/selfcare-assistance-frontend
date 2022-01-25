import { ErrorBoundary, LoadingOverlay } from '@pagopa/selfcare-common-frontend';
import withLogin from '@pagopa/selfcare-common-frontend/decorators/withLogin';
import Layout from './components/Layout/Layout';
import Assistance from './pages/Assistance/Assistance';

const App = () => (
  <ErrorBoundary>
    <Layout>
      <LoadingOverlay />
      <Assistance />
    </Layout>
  </ErrorBoundary>
);

export default withLogin(App);
