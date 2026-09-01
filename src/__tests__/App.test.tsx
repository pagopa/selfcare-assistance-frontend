import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore } from '../redux/store';
import App from '../App';
import { storageTokenOps, isExpiredToken } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { onRedirectToLogin } from '../api/DashboardApiClient';

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pagopa/selfcare-common-frontend/lib/utils/storage')>();
  return {
    ...actual,
    storageTokenOps: {
      read: vi.fn(),
    },
    isExpiredToken: vi.fn(),
  };
});

vi.mock('../api/DashboardApiClient', () => ({
  onRedirectToLogin: vi.fn(),
}));

vi.mock('../services/assistanceService');

const renderApp = () => {
  const store = createStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </Provider>
  );
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing when no token', () => {
    vi.mocked(storageTokenOps.read).mockReturnValue(null as unknown as string);
    renderApp();
    expect(document.body).toBeTruthy();
  });

  test('renders without crashing when token is valid', () => {
    vi.mocked(storageTokenOps.read).mockReturnValue('valid-token');
    vi.mocked(isExpiredToken).mockReturnValue(false);
    renderApp();
    expect(document.body).toBeTruthy();
    expect(onRedirectToLogin).not.toHaveBeenCalled();
  });

  test('redirects to login when token is expired', () => {
    vi.mocked(storageTokenOps.read).mockReturnValue('expired-token');
    vi.mocked(isExpiredToken).mockReturnValue(true);
    vi.useFakeTimers();

    renderApp();

    expect(onRedirectToLogin).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
