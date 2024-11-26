import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Assistance from '../Assistance';
import { verifyMockExecution as verifyLoginMockExecution } from '@pagopa/selfcare-common-frontend/lib/decorators/__mocks__/withLogin';
import { Provider } from 'react-redux';
import { createStore } from './../../../redux/store';
import './../../../locale';
import React from 'react';

jest.mock('@pagopa/selfcare-common-frontend/lib/decorators/withLogin');
jest.mock('../../../services/assistanceService');
jest.mock('i18next-browser-languagedetector');

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
