import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Assistance from '../Assistance';
import { verifyMockExecution as verifyLoginMockExecution } from '../../../__mocks__/@pagopa/selfcare-common-frontend/decorators/withLogin';
import { Provider } from 'react-redux';
import { createStore } from './../../../redux/store';
import './../../../locale';

jest.mock('@pagopa/selfcare-common-frontend/decorators/withLogin');
jest.mock('../../../services/assistanceService');

const fieldsValue = {
  email: 'email@example.com',
};

const renderApp = (injectedStore?: ReturnType<typeof createStore>) => {
  const store = injectedStore ? injectedStore : createStore();
  render(
    <Provider store={store}>
      <Assistance />
    </Provider>
  );
  return { store };
};

test('test render', async () => {
  renderApp();
});

test('test send request to support', async () => {
  const { store } = renderApp();
  verifyLoginMockExecution(store.getState());
  const button = screen.getByRole('button', { name: 'Avanti' });

  expect(button).toBeDisabled();

  const emailField = document.querySelector('#email');
  const confirmEmailField = document.querySelector('#confirmEmail');

  fireEvent.change(emailField, { target: { value: fieldsValue.email } });
  fireEvent.change(confirmEmailField, { target: { value: fieldsValue.email } });

  await waitFor(() => expect(button).toBeEnabled());

  fireEvent.click(button);
});

test('test errors helpertext on input fields and consequent behavior of the forward button', async () => {
  const { store } = renderApp();
  verifyLoginMockExecution(store.getState());
  const button = screen.getByRole('button', { name: 'Avanti' });

  expect(button).toBeDisabled();

  const emailField = document.querySelector('#email');
  const confirmEmailField = document.querySelector('#confirmEmail');

  fireEvent.change(emailField, { target: { value: 'wrongEmailTest' } });
  fireEvent.change(confirmEmailField, { target: { value: 'wrongEmailTest' } });

  await waitFor(() => expect(button).toBeDisabled());
  await waitFor(() => screen.getByText('L’indirizzo email non è valido'));

  fireEvent.change(emailField, { target: { value: fieldsValue.email } });
  fireEvent.change(confirmEmailField, { target: { value: 'wrongEmailTest' } });

  await waitFor(() => expect(button).toBeDisabled());
  await waitFor(() =>
    screen.getByText("L’indirizzo email di conferma non è uguale all'indirizzo email inserito")
  );

  fireEvent.change(emailField, { target: { value: fieldsValue.email } });
  fireEvent.change(confirmEmailField, { target: { value: fieldsValue.email } });

  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
});
