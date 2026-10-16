import { AssistanceRequest } from '../../pages/Assistance/Assistance';
import { SupportResponse } from '../../api/generated/b4f-dashboard/SupportResponse';

export const saveAssistance = async (_value: AssistanceRequest): Promise<void> =>
  new Promise<void>((resolve) => resolve());

export const sendRequestToSupport = vi.fn(
  (
    _email: string,
    _productId: string,
    _data?: string,
    _category?: string
  ): Promise<SupportResponse> => new Promise<SupportResponse>(() => undefined)
);
