import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from '../../../redux/store';
import Layout from '../Layout';

vi.mock('@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor', () => ({
  useUnloadEventOnExit: vi.fn(() => vi.fn()),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  Header: ({ children }: { children?: React.ReactNode }) => (
    <header data-testid="header">{children}</header>
  ),
  Footer: ({ children }: { children?: React.ReactNode }) => (
    <footer data-testid="footer">{children}</footer>
  ),
}));

const renderLayout = (children?: React.ReactNode) => {
  const store = createStore();
  return render(
    <Provider store={store}>
      <Layout>{children}</Layout>
    </Provider>
  );
};

describe('Layout', () => {
  test('renders header and footer', () => {
    renderLayout();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('renders children', () => {
    renderLayout(<div data-testid="child-content">Test Content</div>);
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});