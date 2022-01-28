import { NotificationManagerApi } from "../api/NotificationManagerApiClient";
import { AssistanceRequest } from "../pages/Assistance/Assistance";
import { CreateMessageDto } from './../api/generated/notification-manager/CreateMessageDto';

export const saveAssistance = async (value: AssistanceRequest): Promise<void> => {
  /* istanbul ignore if */
  if (process.env.REACT_APP_API_MOCK_ASSISTANCE === 'true') {
    return new Promise<void>((resolve) => resolve());
  } else {
      return NotificationManagerApi.save(assistanceRequest2CreateMessageDto(value));
  }
};

export const assistanceRequest2CreateMessageDto = (e: AssistanceRequest):CreateMessageDto => ({
  content:e.message,
  subject:e.messageObject
});