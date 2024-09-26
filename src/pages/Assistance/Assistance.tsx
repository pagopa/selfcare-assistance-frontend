import { Box, Button, Grid, Link, Paper, TextField, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import TitleBox from '@pagopa/selfcare-common-frontend/lib/components/TitleBox';
import withLogin from '@pagopa/selfcare-common-frontend/lib/decorators/withLogin';
import useLoading from '@pagopa/selfcare-common-frontend/lib/hooks/useLoading';
import {
  useUnloadEventInterceptor,
  useUnloadEventOnExit,
} from '@pagopa/selfcare-common-frontend/lib/hooks/useUnloadEventInterceptor';
import {
  AppError,
  appStateActions,
} from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { useFormik } from 'formik';
import { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { emailRegexp } from '@pagopa/selfcare-common-frontend/lib/utils/constants';
import { LOADING_TASK_SAVE_ASSISTANCE } from '../../utils/constants';
import { ENV } from '../../utils/env';
import { SupportResponse } from '../../api/generated/b4f-dashboard/SupportResponse';
import { sendRequestToSupport } from '../../services/assistanceService';
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

  const [zendeskAuthData, setZendeskAuthData] = useState<SupportResponse>();

  const requestIdRef = useRef<string>();

  const productIdByUrl = new URLSearchParams(window.location.search).get('productId');

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
          ? t('assistancePage.dataValidate.invalidEmail')
          : undefined,
        confirmEmail: !values.confirmEmail
          ? requiredError
          : values.confirmEmail !== values.email
          ? t('assistancePage.dataValidate.notEqualConfirmEmail')
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
      setLoading(true);
      sendRequestToSupport(values.email, productId)
        .then((res) => setZendeskAuthData(res))
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
        t('assistancePage.unloadEvent.title'),
        t('assistancePage.unloadEvent.description')
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
      <Grid item xs={12} alignContent="center" display="grid" maxWidth={{ md: '684px' }}>
        <TitleBox
          title={t('assistancePage.title')}
          subTitle={t('assistancePage.subTitle')}
          mtTitle={3}
          mbTitle={2}
          mbSubTitle={4}
          variantTitle="h4"
          variantSubTitle="body1"
        />
        <form id="jwtForm" method="POST" target="_blank" action={zendeskAuthData?.actionUrl}>
          <input id="jwtString" type="hidden" name="jwt" value={zendeskAuthData?.jwt} />
          <input
            id="returnTo"
            type="hidden"
            name="return_to"
            value={zendeskAuthData?.redirectUrl}
          />
        </form>
        <form onSubmit={formik.handleSubmit}>
          <Paper sx={{ p: 3, borderRadius: theme.spacing(0.5) }}>
            <Grid container item direction="column" spacing={3}>
              <Grid item xs={12} pb={1}>
                <CustomTextField
                  {...baseTextFieldProps('email', t('assistancePage.email.label'))}
                  size="small"
                  onCopy={preventClipboardEvents}
                  onPaste={preventClipboardEvents}
                ></CustomTextField>
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  {...baseTextFieldProps('confirmEmail', t('assistancePage.confirmEmail.label'))}
                  size="small"
                  onCopy={preventClipboardEvents}
                  onPaste={preventClipboardEvents}
                ></CustomTextField>
              </Grid>
            </Grid>
          </Paper>
          <Typography variant="body2" mt={2} color={theme.palette.text.secondary}>
            <Trans i18nKey="assistancePage.linkPrivacyPolicy">
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
                {t('assistancePage.back')}
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
                {t('assistancePage.forward')}
              </Button>
            </Box>
          </Box>
        </form>
      </Grid>
    </Grid>
  );
};

export default withLogin(Assistance);
