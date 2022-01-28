import { useEffect } from 'react';
import { User } from '@pagopa/selfcare-common-frontend/model/User';
import { userActions } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { useAppDispatch } from '../../../../redux/hooks';
import { RootState } from '../../../../redux/store';

export const mockedUser: User = {
  name: 'NAME',
  surname: 'SURNAME',
  uid: 'UID',
  taxCode: 'AAAAAA00A00A000A',
  email: 'a@a.aa',
};

export const verifyMockExecution = (state: RootState) => {
  expect(state.user.logged).toMatchObject(mockedUser);
};

export default (WrappedComponent: React.ComponentType<any>) => () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(userActions.setLoggedUser(mockedUser));
  }, []);
  return <WrappedComponent />;
};
