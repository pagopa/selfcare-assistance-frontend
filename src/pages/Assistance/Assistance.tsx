import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import { styled } from '@mui/system';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import { AppError } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { appStateActions } from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import {
  useUnloadEventInterceptor,
  useUnloadEventOnExit,
} from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import { uniqueId } from 'lodash';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useTranslation, Trans } from 'react-i18next';
import withLogin from '@pagopa/selfcare-common-frontend/decorators/withLogin';
import { saveAssistance } from '../../services/assistanceService';
import { LOADING_TASK_SAVE_ASSISTANCE } from '../../utils/constants';
import { useAppDispatch } from './../../redux/hooks';
import ThankyouPage from './ThankyouPage';

export type AssistanceRequest = {
  name?: string;
  surname?: string;
  email?: string;
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
  '.MuiInputLabel-root.Mui-disabled': {
    color: '#A2ADB8',
  },
  '.MuiInputLabel-root.Mui-focused': {
    // color: '#5C6F82',
    fontWeight: '700',
  },
  '.MuiInputLabel-root': {
    color: '#5C6F82',
    fontSize: '16px',
    fontWeight: '600',
  },
  input: {
    color: 'black',
    fontSize: '16px',
    fontWeight: '600',
    '&::placeholder': {
      color: '#5C6F82',
      opacity: '1',
    },
    '&.Mui-disabled': {
      WebkitTextFillColor: '#A2ADB8',
    },
  },
});
const CustomTextArea = styled(TextField)({
  textarea: {
    fontSize: '16px',
    fontWeight: '600',
    '&::placeholder': {
      fontStyle: 'normal',
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
  const theme = useTheme();

  const onExit = useUnloadEventOnExit();
  const { registerUnloadEvent, unregisterUnloadEvent } = useUnloadEventInterceptor();

  const dispatch = useAppDispatch();
  const setLoading = useLoading(LOADING_TASK_SAVE_ASSISTANCE);

  const requestIdRef = useRef<string>();

  const addError = (error: AppError) => dispatch(appStateActions.addError(error));

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
          : undefined
      }).filter(([_key, value]) => value)
    );

  const formik = useFormik<AssistanceRequest>({
    initialValues: {
      email: '',
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

  useEffect(() => {
    if (formik.dirty) {
      registerUnloadEvent(
        t('assistancePageForm.unloadEvent.title'),
        t('assistancePageForm.unloadEvent.description')
      );
    } else {
      unregisterUnloadEvent();
    }
  }, [formik.dirty]);

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
      variant: 'outlined' as const,
      onChange: formik.handleChange,
      sx: { width: '100%', '.disabled': { color: 'red' } },
      InputProps: {
        style: {
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          color: '#5C6F82',
          textAlign: 'start' as const,
        },
      },
    };
  };

  const baseTextAreaProps = (
    field: keyof AssistanceRequest,
    rows: number,
    label?: string,
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
      label,
      placeholder,
      sx: { width: '100%' },
      onChange: formik.handleChange,
      inputProps: { maxLength },
    };
  };

  return (
    <React.Fragment>
      {!viewThxPage ? (
        <Grid
          container
          item
          justifyContent="center"
          display="flex"
          sx={{ backgroundColor: 'rgb(242, 242, 242)' }}
        >
          <Box px={24}>
            <TitleBox
              title={t('assistancePageForm.title')}
              subTitle={t('assistancePageForm.subTitle')}
              mtTitle={3}
              mbTitle={2}
              mbSubTitle={4}
              variantTitle="h4"
              variantSubTitle="body1"
              titleFontSize={'32px'}
              subTitleFontSize={'18px'}
            />
            <form onSubmit={formik.handleSubmit}>
              <Paper elevation={8} sx={{p:3,borderRadius: theme.spacing(0.5)}}>
                <Grid container direction="column">
                  <Grid container item>
                    <Grid item xs={12} sx={{ height: '75px' }} pb={2}>
                      <CustomTextField
                        className="messageObject"
                        {...baseTextFieldProps(
                          'messageObject',
                          t('assistancePageForm.messageObject.placeholder'),
                          ''
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} mb={3} pb={2}>
                      <Box sx={{ marginTop: '-12px', marginLeft: '13px' }}>
                        <Typography variant="body2" sx={{ fontSize: '14px', color: '#5A768A' }}>
                          {t('assistancePageForm.messageObject.helperText')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container item spacing={2}>
                    <Grid item xs={12} mb={4} sx={{ height: '75px' }}>
                      <CustomTextField
                        {...baseTextFieldProps(
                          'email',
                          t('assistancePageForm.email.label'),
                          t('assistancePageForm.email.placeholder')
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item spacing={3}>
                    <Grid item xs={12}>
                      <CustomTextArea
                        {...baseTextAreaProps(
                          'message',
                          3,
                          t('assistancePageForm.messageTextArea.placeholder'),
                          '',
                          500
                        )}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontSize: '14px', marginLeft: '13px' }}
                        mt={1}
                      >
                        {t('assistancePageForm.messageTextArea.allowedLength')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
              <Box my={4} display='flex' justifyContent='center'>
                <Box mr={2}>
                  <Button
                    sx={{ fontWeight: 700 }}
                    color="primary"
                    variant="outlined"
                    onClick={() => onExit(() => window.location.assign(document.referrer))}
                  >
                    {t('assistancePageForm.backButton')}
                  </Button>
                </Box>
                <Box>
                  <Button
                    disabled={!formik.dirty || !formik.isValid}
                    color="primary"
                    variant="contained"
                    type="submit"
                  >
                    {t('assistancePageForm.confirmButton')}
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Grid>
      ) : (
        <Grid
          container
          item
          justifyContent="center"
          display="flex"
          sx={{ backgroundColor: 'rgb(242, 242, 242)' }}
        >
          <ThankyouPage
            title={
              (
                <Trans i18nKey="thankyouPage.title">
                  Abbiamo ricevuto la tua <br /> richiesta
                </Trans>
              ) as unknown as string
            }
            description={t('thankyouPage.description')}
            onAction={() => window.location.assign(document.referrer)}
          />
        </Grid>
      )}
    </React.Fragment>
  );
};

export default withLogin(Assistance);
