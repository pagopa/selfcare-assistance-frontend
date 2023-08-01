import { AssistanceRequest } from '../../pages/Assistance/Assistance';

test('Test assistanceRequest2CreateMessageDto', () => {
  const assistanceRequest: AssistanceRequest = {
    email: 'test@test.it',
    confirmEmail: 'test@test.it',
  };
  expect(assistanceRequest).toStrictEqual({
    email: 'test@test.it',
    confirmEmail: 'test@test.it',
  });
});
