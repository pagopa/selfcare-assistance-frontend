import { AssistanceRequest } from '../../pages/Assistance/Assistance';
import { assistanceRequest2CreateMessageDto } from '../assistanceService';

test('Test assistanceRequest2CreateMessageDto', () => {
  const assistanceRequest: AssistanceRequest = {
    messageObject: 'messageObject',
    message: 'message',
    email: 'test@test.it',
  };
  const result = assistanceRequest2CreateMessageDto(assistanceRequest);
  expect(result).toStrictEqual({
    subject: 'messageObject',
    content: 'message',
    senderEmail: 'test@test.it',
  });
});
