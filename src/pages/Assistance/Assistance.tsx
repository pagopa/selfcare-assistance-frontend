import { Box, Button, Grid, Link, Paper, TextField, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import TitleBox from '@pagopa/selfcare-common-frontend/components/TitleBox';
import withLogin from '@pagopa/selfcare-common-frontend/decorators/withLogin';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import {
  useUnloadEventInterceptor,
  useUnloadEventOnExit,
} from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import {
  AppError,
  appStateActions,
} from '@pagopa/selfcare-common-frontend/redux/slices/appStateSlice';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useFormik } from 'formik';
import { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { emailRegexp } from '@pagopa/selfcare-common-frontend/utils/constants';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { isExpiredToken } from '@pagopa/selfcare-common-frontend/utils/storage';
import { LOADING_TASK_SAVE_ASSISTANCE } from '../../utils/constants';
import { ENV } from '../../utils/env';
import { onRedirectToLogin } from '../../api/DashboardApiClient';
import { ZendeskAuthorizationDTO } from '../../model/ZendeskAuthorizationDTO';
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

const Assistance = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const onExit = useUnloadEventOnExit();
  const { registerUnloadEvent, unregisterUnloadEvent } = useUnloadEventInterceptor();
  const setLoading = useLoading(LOADING_TASK_SAVE_ASSISTANCE);

  const addError = (error: AppError) => dispatch(appStateActions.addError(error));

  const [zendeskAuthData, setZendeskAuthData] = useState<ZendeskAuthorizationDTO>();

  const requestIdRef = useRef<string>();

  const urlParams = new URLSearchParams(window.location.search);
  const productIdByUrl = urlParams.get('productId');

  useEffect(() => {
    const token = storageTokenOps.read();
    if (token) {
      const isExpiredSession = isExpiredToken(token);
      if (isExpiredSession) {
        onRedirectToLogin();
        window.setTimeout(() => window.location.assign(ENV.URL_FE.LOGOUT), 2000);
      }
    }
  }, []);

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

  useEffect(() => {
    if (zendeskAuthData) {
      const form = document.getElementById('jwtForm') as HTMLFormElement;
      if (form) {
        form.submit();
      }
    }
  }, [zendeskAuthData]);

  const formik = useFormik<AssistanceRequest>({
    initialValues: {
      email: '',
      confirmEmail: '',
    },
    validate,
    onSubmit: async (values: AssistanceRequest) => {
      const productId = productIdByUrl
        ? productIdByUrl
        : window.location.hostname?.startsWith('pnpg') ||
          window.location.hostname?.startsWith('imprese')
        ? 'prod-pn-pg'
        : 'prod-selfcare';
      const token = storageTokenOps.read();
      const formData = {
        email: values.email,
        productId,
      };

      setLoading(true);
      await fetch(ENV.URL_API.API_DASHBOARD + '/v1/support', {
        headers: {
          accept: '*/*',
          'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(formData),
        method: 'POST',
        mode: 'cors',
      })
        .then((res) => res.text())
        .then((res) => {
          const tempDiv = document.createElement('div');
          // eslint-disable-next-line functional/immutable-data
          tempDiv.innerHTML = res;
          setZendeskAuthData({
            action_url: tempDiv?.querySelector('#jwtForm')?.getAttribute('action') ?? '',
            jwt: tempDiv?.querySelector('#jwtString')?.getAttribute('value') ?? '',
            return_to: tempDiv?.querySelector('#returnTo')?.getAttribute('value') ?? '',
          });
          trackEvent('CUSTOMER_CARE_CONTACT_SUCCESS', { request_id: requestIdRef.current });
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

  const preventClipboardEvents = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  return (
    <Grid
      container
      item
      justifyContent="center"
      display="flex"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <Grid item xs={6} alignContent="center" display="grid" maxWidth={{ md: '684px' }}>
        <TitleBox
          title={t('assistancePageForm.title')}
          subTitle={t('assistancePageForm.subTitle')}
          mtTitle={3}
          mbTitle={2}
          mbSubTitle={4}
          variantTitle="h3"
          variantSubTitle="body1"
        />
        <form id="jwtForm" method="POST" target="_blank" action={zendeskAuthData?.action_url}>
          <input id="jwtString" type="hidden" name="jwt" value={zendeskAuthData?.jwt} />
          <input id="returnTo" type="hidden" name="return_to" value={zendeskAuthData?.return_to} />
        </form>
        <form onSubmit={formik.handleSubmit}>
          <Paper sx={{ p: 3, borderRadius: theme.spacing(0.5) }}>
            <Grid container item direction="column" spacing={3}>
              <Grid item xs={12} pb={1}>
                <CustomTextField
                  {...baseTextFieldProps('email', t('assistancePageForm.email.label'))}
                  size="small"
                  onCopy={preventClipboardEvents}
                  onPaste={preventClipboardEvents}
                ></CustomTextField>
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  {...baseTextFieldProps(
                    'confirmEmail',
                    t('assistancePageForm.confirmEmail.label')
                  )}
                  size="small"
                  onCopy={preventClipboardEvents}
                  onPaste={preventClipboardEvents}
                ></CustomTextField>
              </Grid>
            </Grid>
          </Paper>
          <Typography variant="body2" mt={2} color={theme.palette.text.secondary}>
            <Trans i18nKey="assistancePageForm.linkPrivacyPolicy">
              Proseguendo dichiari di aver letto la
              <Link
                sx={{ cursor: 'pointer', textDecoration: 'none' }}
                href={ENV.URL_FILE.PRIVACY_POLICY}
              >
                Privacy Policy Assistenza
              </Link>
            </Trans>
          </Typography>
          <Box my={4} display="flex" justifyContent="space-between">
            <Box>
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => onExit(() => history.go(-1))}
              >
                {t('assistancePageForm.back')}
              </Button>
            </Box>
            <Box>
              <Button
                size="small"
                color="primary"
                variant="contained"
                type="submit"
                disabled={!formik.dirty || !formik.isValid}
              >
                {t('assistancePageForm.forward')}
              </Button>
            </Box>
          </Box>
        </form>
      </Grid>
    </Grid>
  );
};

export default withLogin(Assistance);
