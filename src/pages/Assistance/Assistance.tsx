import { useEffect, useRef } from 'react';
import { Box, Button, Grid, Paper, TextField, useTheme } from '@mui/material';
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
import { useTranslation } from 'react-i18next';
import withLogin from '@pagopa/selfcare-common-frontend/decorators/withLogin';
import { sendRequestToSupport } from '../../services/assistanceService';
import { LOADING_TASK_SAVE_ASSISTANCE } from '../../utils/constants';
import { useAppDispatch } from './../../redux/hooks';

export type AssistanceRequest = {
  email: string;
  confirmEmail: string;
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
    fontWeight: '700',
  },
  '.MuiInputLabel-root': {
    color: '#5C6F82',
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

const requiredError = 'Required';
const emailRegexp = new RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,5}$');

const Assistance = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const onExit = useUnloadEventOnExit();
  const { registerUnloadEvent, unregisterUnloadEvent } = useUnloadEventInterceptor();
  const setLoading = useLoading(LOADING_TASK_SAVE_ASSISTANCE);

  const addError = (error: AppError) => dispatch(appStateActions.addError(error));

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
        email: !values.email
          ? requiredError
          : !emailRegexp.test(values.email)
          ? t('assistancePageForm.dataValidate.invalidEmail')
          : undefined,
        confirmEmail: !values.confirmEmail
          ? requiredError
          : values.confirmEmail !== values.email
          ? t('assistancePageForm.dataValidate.notEqualConfirmEmail')
          : undefined,
      }).filter(([_key, value]) => value)
    );

  const formik = useFormik<AssistanceRequest>({
    initialValues: {
      email: '',
      confirmEmail: '',
    },
    validate,
    onSubmit: (values: AssistanceRequest) => {
      setLoading(true);
      sendRequestToSupport(values.email)
        .then((response) => {
          if (response.redirectUrl) {
            trackEvent('CUSTOMER_CARE_CONTACT_SUCCESS', { request_id: requestIdRef.current });
            unregisterUnloadEvent();
            window.open(response.redirectUrl, '_blank');
          }
        })
        .catch((reason) => {
          trackEvent('CUSTOMER_CARE_CONTACT_FAILURE', { request_id: requestIdRef.current });
          addError({
            id: 'SEND_REQUEST_FAILED',
            blocking: false,
            error: reason,
            techDescription: `An error occurred while sending request to assistance from ${requestIdRef.current}`,
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
      sx: { width: '100%', '.disabled': { color: theme.palette.error } },
      InputProps: {
        style: {
          fontWeight: 'fontWeightRegular',
          lineHeight: '24px',
          color: theme.palette.text.secondary,
          textAlign: 'start' as const,
        },
      },
    };
  };

  return (
    <Grid container xs={12}>
      <Grid
        container
        item
        justifyContent="center"
        display="flex"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <Grid item xs={6}>
          <TitleBox
            title={t('assistancePageForm.title')}
            subTitle={t('assistancePageForm.subTitle')}
            mtTitle={3}
            mbTitle={2}
            mbSubTitle={4}
            variantTitle="h3"
            variantSubTitle="body1"
          />
          <form onSubmit={formik.handleSubmit}>
            <Paper sx={{ p: 3, borderRadius: theme.spacing(0.5) }}>
              <Grid container item direction="column" spacing={3}>
                <Grid item xs={12}>
                  <CustomTextField
                    {...baseTextFieldProps('email', t('assistancePageForm.email.label'))}
                    size="small"
                  ></CustomTextField>
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    {...baseTextFieldProps(
                      'confirmEmail',
                      t('assistancePageForm.confirmEmail.label')
                    )}
                    size="small"
                  ></CustomTextField>
                </Grid>
              </Grid>
            </Paper>
            <Box my={5} display="flex" justifyContent="space-between">
              <Box>
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => onExit(() => window.location.assign(document.referrer))}
                >
                  {t('assistancePageForm.back')}
                </Button>
              </Box>
              <Box>
                <Button
                  disabled={!formik.dirty || !formik.isValid}
                  color="primary"
                  variant="contained"
                  type="submit"
                >
                  {t('assistancePageForm.forward')}
                </Button>
              </Box>
            </Box>
          </form>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default withLogin(Assistance);
