import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Assistance from '../Assistance';
import { verifyMockExecution as verifyLoginMockExecution } from '@pagopa/selfcare-common-frontend/lib/decorators/__mocks__/withLogin';
import { createStore } from './../../../redux/store';
import './../../../locale';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { Provider } from 'react-redux';

// vi.mock('@pagopa/selfcare-common-frontend/lib/decorators/withLogin');
vi.mock('../../../services/assistanceService');

const fieldsValue = {
  email: 'email@example.com',
};

beforeAll(() => {
  i18n.changeLanguage('it');
});

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
  const button = document.getElementById('assistanceForwardButton') as HTMLButtonElement;

  expect(button).toBeDisabled();

  const emailField = document.querySelector('#email') as HTMLInputElement;
  const confirmEmailField = document.querySelector('#confirmEmail') as HTMLInputElement;

  fireEvent.change(emailField, { target: { value: fieldsValue.email } });
  fireEvent.change(confirmEmailField, { target: { value: fieldsValue.email } });

  await waitFor(() => expect(button).toBeEnabled());

  fireEvent.click(button);
});

test('test errors helpertext on input fields and consequent behavior of the forward button', async () => {
  const { store } = renderApp();
  verifyLoginMockExecution(store.getState());
  const button = document.getElementById('assistanceForwardButton') as HTMLButtonElement;

  expect(button).toBeDisabled();

  const emailField = document.querySelector('#email') as HTMLInputElement;
  const confirmEmailField = document.querySelector('#confirmEmail') as HTMLInputElement;

  fireEvent.change(emailField, { target: { value: 'wrongEmailTest' } });
  fireEvent.change(confirmEmailField, { target: { value: 'wrongEmailTest' } });

  await waitFor(() => expect(button).toBeDisabled());
  await waitFor(() => screen.getByText('assistancePage.dataValidate.invalidEmail'));

  fireEvent.change(emailField, { target: { value: fieldsValue.email } });
  fireEvent.change(confirmEmailField, { target: { value: 'wrongEmailTest' } });

  await waitFor(() => expect(button).toBeDisabled());
  await waitFor(() =>
    screen.getByText('assistancePage.dataValidate.notEqualConfirmEmail')
  );

  fireEvent.change(emailField, { target: { value: fieldsValue.email } });
  fireEvent.change(confirmEmailField, { target: { value: fieldsValue.email } });

  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
});

test('test PEC email is rejected with dedicated helper text', async () => {
  const { store } = renderApp();
  verifyLoginMockExecution(store.getState());
  const button = document.getElementById('assistanceForwardButton') as HTMLButtonElement;

  const emailField = document.querySelector('#email') as HTMLInputElement;
  const confirmEmailField = document.querySelector('#confirmEmail') as HTMLInputElement;

  fireEvent.change(emailField, { target: { value: 'test@pec.it' } });
  fireEvent.change(confirmEmailField, { target: { value: 'test@pec.it' } });

  await waitFor(() => expect(button).toBeDisabled());
  await waitFor(() => screen.getByText('assistancePage.dataValidate.invalidPecEmail'));
});
