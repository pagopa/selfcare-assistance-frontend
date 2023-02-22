import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useAppSelector } from '../../../redux/hooks';
import Assistance, { AssistanceRequest } from '../Assistance';
import { userSelectors } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import withLogin from '@pagopa/selfcare-common-frontend/decorators/withLogin';
import { store } from '../../../redux/store';
import { verifyMockExecution as verifyLoginMockExecution } from '../../../__mocks__/@pagopa/selfcare-common-frontend/decorators/withLogin';
import { Provider } from 'react-redux';
import { createStore } from './../../../redux/store';
import { act } from 'react-dom/test-utils';
import './../../../locale';

jest.mock('@pagopa/selfcare-common-frontend/decorators/withLogin');
jest.mock('../../../services/assistanceService');

const fieldsValue = {
  messageObject: 'Documentazione',
  message:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse quis dictum mi. Morbi auctor nibh ante, eget interdum urna malesuada in. Suspendisse at condimentum leo. Sed ultricies, velit quis porta iaculis, libero massa consequat augue, vitae pharetra nisi urna eget nisl. Nam convallis,',
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
test('test render whit compiled form', async () => {
  const { store } = renderApp();
  verifyLoginMockExecution(store.getState());
  const button = screen.getByRole('button', { name: 'Invia' });

  expect(button).toBeDisabled();

  const messageObjectInput = document.querySelector('#messageObject');
  const messageTextArea = document.querySelector('#message');
  const emailInput = document.querySelector('#email');

  fireEvent.change(messageObjectInput, { target: { value: fieldsValue.messageObject } });
  fireEvent.change(messageTextArea, { target: { value: fieldsValue.message } });
  fireEvent.change(emailInput, { target: { value: fieldsValue.email } });

  await waitFor(() => expect(button).toBeEnabled());

  screen.getByText('Invia');
  fireEvent.click(button);

  await waitFor(() => screen.getByText('Abbiamo ricevuto la tua richiesta'));
});

test('test validate email field', async () => {
  const { store } = renderApp();
  verifyLoginMockExecution(store.getState());
  const button = screen.getByRole('button', { name: 'Invia' });

  expect(button).toBeDisabled();

  const messageObjectInput = document.querySelector('#messageObject');
  const messageTextArea = document.querySelector('#message');
  const emailInput = document.querySelector('#email');

  fireEvent.change(messageObjectInput, { target: { value: fieldsValue.messageObject } });
  fireEvent.change(messageTextArea, { target: { value: fieldsValue.message } });
  fireEvent.change(emailInput, { target: { value: 'wrongEmailTest' } });

  await waitFor(() => expect(button).toBeDisabled());
  await waitFor(() => screen.getByText('L’indirizzo email non è valido'));

  fireEvent.change(emailInput, { target: { value: fieldsValue.email } });

  await waitFor(() => expect(button).toBeEnabled());
  screen.getByText('Invia');
  fireEvent.click(button);

  await waitFor(() => screen.getByText('Abbiamo ricevuto la tua richiesta'));
});
