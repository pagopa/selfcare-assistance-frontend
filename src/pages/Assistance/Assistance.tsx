import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { styled } from '@mui/system';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import { userSelectors } from '@pagopa/selfcare-common-frontend/redux/slices/userSlice';
import { AppError } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import {
  useUnloadEventInterceptor,
  useUnloadEventOnExit,
  useUnloadEventInterceptorAndActivate,
} from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import { uniqueId } from 'lodash';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation } from 'react-i18next';
import withLogin from '@pagopa/selfcare-common-frontend/decorators/withLogin';
import { useAppSelector } from '../../redux/hooks';
import { saveAssistance } from '../../services/assistanceService';
import { LOADING_TASK_SAVE_ASSISTANCE } from '../../utils/constants';
import { useAppDispatch } from './../../redux/hooks';
import ThankyouPage from './ThankyouPage';

export type AssistanceRequest = {
  name?: string;
  surname?: string;
  email?: string;
  emailConfirm?: string;
  message: string;
  messageObject: string;
};

const CustomTextField = styled(TextField)({
  '& .MuiInputBase-root.Mui-disabled:before': {
    borderBottomStyle: 'solid',
  },
  '.MuiInputLabel-asterisk': {
    display: 'none',
  },
  '.MuiInput-root': {
    '&:after': {
      borderBottom: '2px solid #5C6F82',
      color: 'green',
    },
  },
  '.MuiInputLabel-root.Mui-focused': {
    color: '#5C6F82',
    fontWeight: '700',
  },
  '.MuiInputLabel-root': {
    color: '#5C6F82',
    fontSize: '14px',
    fontWeight: '700',
  },
  input: {
    color: '#17324D',
    fontSize: '20px',
    fontWeight: '700',
    // textTransform: "capitalize",
    '&::placeholder': {
      color: '#5C6F82',
      opacity: '1',
    },
    '&.Mui-disabled': {
      WebkitTextFillColor: '#5C6F82',
    },
  },
});
const CustomTextArea = styled(TextField)({
  textarea: {
    fontSize: '16px',
    fontWeight: '400',
    '&::placeholder': {
      fontStyle: 'italic',
      color: '#5C6F82',
      opacity: '1',
    },
  },
});

const requiredError = 'Required';
const emailRegexp = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');

const Assistance = () => {
  const { t } = useTranslation();

  const [viewThxPage, setThxPage] = useState(false);

  useUnloadEventInterceptorAndActivate(
    t('assistancePageForm.unloadEvent.title'),
    t('assistancePageForm.unloadEvent.description')
  );
  const onExit = useUnloadEventOnExit();
  const { unregisterUnloadEvent } = useUnloadEventInterceptor();

  const dispatch = useAppDispatch();
  const addError = (error: AppError) => dispatch(appStateActions.addError(error));
  const setLoading = useLoading(LOADING_TASK_SAVE_ASSISTANCE);

  const user = useAppSelector(userSelectors.selectLoggedUser);
  const requestIdRef = useRef<string>();

  useEffect(() => {
    if (!requestIdRef.current) {
      // eslint-disable-next-line functional/immutable-data
      requestIdRef.current = uniqueId();
      trackEvent('CUSTOMER_CARE_CONTACT', { request_id: requestIdRef.current });
    }
  }, []);

  const validate = (values: Partial<AssistanceRequest>) =>
    Object.fromEntries(
      Object.entries({
        messageObject: !values.messageObject ? requiredError : undefined,
        message: !values.message ? requiredError : undefined,
        email: !values.email
          ? requiredError
          : !emailRegexp.test(values.email)
          ? t('assistancePageForm.dataValidate.invalidEmail')
          : undefined,
        emailConfirm: !values.emailConfirm
          ? requiredError
          : values.emailConfirm !== values.email
          ? t('assistancePageForm.dataValidate.notEqualConfirmEmail')
          : undefined,
      }).filter(([_key, value]) => value)
    );

  const formik = useFormik<AssistanceRequest>({
    initialValues: {
      email: user?.email ?? '',
      emailConfirm: user?.email ?? '',
      message: '',
      messageObject: '',
    },
    validate,
    onSubmit: (values) => {
      setLoading(true);
      saveAssistance(values)
        .then(() => {
          unregisterUnloadEvent();
          setThxPage(true);
          trackEvent('CUSTOMER_CARE_CONTACT_SUCCESS', { request_id: requestIdRef.current });
        })
        .catch((reason) => {
          trackEvent('CUSTOMER_CARE_CONTACT_FAILURE', { request_id: requestIdRef.current });
          addError({
            id: 'SAVE_ASSISTANCE',
            blocking: false,
            error: reason,
            techDescription: `An error occurred while saving assistance form`,
            toNotify: false,
          });
        })
        .finally(() => setLoading(false));
    },
  });

  const baseTextFieldProps = (
    field: keyof AssistanceRequest,
    label?: string,
    placeholder?: string
  ) => {
    const isError = !!formik.errors[field] && formik.errors[field] !== requiredError;
    return {
      id: field,
      type: 'text',
      value: formik.values[field],
      label,
      placeholder,
      error: isError,
      helperText: isError ? formik.errors[field] : undefined,
      required: true,
      variant: 'standard' as const,
      onChange: formik.handleChange,
      sx: { width: '100%' },
      InputProps: {
        style: {
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          color: '#5C6F82',
          textAlign: 'start' as const,
          paddingLeft: '16px',
        },
      },
    };
  };

  const baseTextAreaProps = (
    field: keyof AssistanceRequest,
    rows: number,
    placeholder?: string,
    maxLength?: number
  ) => {
    const isError = !!formik.errors[field] && formik.errors[field] !== requiredError;
    return {
      multiline: true,
      id: field,
      name: field,
      error: isError,
      rows,
      placeholder,
      sx: { width: '100%' },
      onChange: formik.handleChange,
      inputProps: { maxLength },
    };
  };

  return (
    <React.Fragment>
      {!viewThxPage ? (
        <Box px={24} my={13}>
          <TitleBox
            title={t('assistancePageForm.title')}
            subTitle={t('assistancePageForm.subTitle')}
            mbTitle={1}
            mbSubTitle={7}
            variantTitle="h1"
            variantSubTitle="h5"
            titleFontSize="48px"
          />
          <form onSubmit={formik.handleSubmit}>
            <Box>
              <Grid container direction="column">
                <Grid container item spacing={3}>
                  <Grid item xs={6} sx={{ height: '75px' }}>
                    <CustomTextField
                      className="messageObject"
                      {...baseTextFieldProps(
                        'messageObject',
                        t('assistancePageForm.messageObject.label'),
                        t('assistancePageForm.messageObject.placeholder')
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} mb={5}>
                    <Box sx={{ marginTop: '-17px' }}>
                      <Typography variant="body2" sx={{ fontSize: '14px', color: '#5A768A' }}>
                        {t('assistancePageForm.messageObject.helperText')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Grid container item spacing={3} mb={8}>
                  <Grid item xs={6} mb={4} sx={{ height: '75px' }}>
                    <CustomTextField
                      disabled={user?.email ? true : false}
                      {...baseTextFieldProps(
                        'email',
                        t('assistancePageForm.email.label'),
                        t('assistancePageForm.email.placeholder')
                      )}
                    />
                  </Grid>
                  {!user?.email && (
                    <Grid item xs={6} mb={4} sx={{ height: '75px' }}>
                      <CustomTextField
                        {...baseTextFieldProps(
                          'emailConfirm',
                          t('assistancePageForm.confirmEmail.label'),
                          t('assistancePageForm.confirmEmail.placeholder')
                        )}
                        inputProps={{ readOnly: user?.email ? true : false }}
                      />
                    </Grid>
                  )}
                </Grid>
                <Grid container item spacing={3}>
                  <Grid item xs={10}>
                    <Typography variant="h3" sx={{ fontSize: '14px', color: '#5A768A' }} mb={2}>
                      {t('assistancePageForm.messageTextArea.typography')}
                    </Typography>
                    <CustomTextArea
                      {...baseTextAreaProps(
                        'message',
                        4,
                        t('assistancePageForm.messageTextArea.placeholder'),
                        200
                      )}
                    />
                    <Typography variant="body2" sx={{ fontSize: '14px' }} mt={1}>
                      {t('assistancePageForm.messageTextArea.allowedLength')}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={2} mt={10}>
              <Grid item xs={3}>
                <Button
                  sx={{ width: '100%' }}
                  color="primary"
                  variant="outlined"
                  onClick={() => onExit(() => window.location.assign(document.referrer))}
                >
                  {t('assistancePageForm.backButton')}
                </Button>
              </Grid>
              <Grid item xs={3}>
                <Button
                  disabled={!formik.dirty || !formik.isValid}
                  sx={{ width: '100%' }}
                  color="primary"
                  variant="contained"
                  type="submit"
                >
                  {t('assistancePageForm.confirmButton')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      ) : (
        <ThankyouPage
          title={t('thankyouPage.title')}
          description={t('thankyouPage.description')}
          onAction={() => window.location.assign(document.referrer)}
        />
      )}
    </React.Fragment>
  );
};

export default withLogin(Assistance);
