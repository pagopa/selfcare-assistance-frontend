import { AssistanceRequest } from "../pages/Assistance/Assistance";

export const saveAssistance = async (_value: AssistanceRequest): Promise<void> => {
  /* istanbul ignore if */
  if (process.env.REACT_APP_API_MOCK_ASSISTANCE === 'true') {
    return new Promise<void>((resolve) => resolve());
  } else {
    //   return DashboardApi.getProductRoles(product.id).then((roles) =>
    //     roles.map((r) => ({ productRole: r }))
    //   );
  }
};

