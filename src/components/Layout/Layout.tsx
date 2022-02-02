import { Grid } from '@mui/material';
import { Box } from '@mui/system';
import { Footer, Header } from '@pagopa/selfcare-common-frontend';
import React from 'react';
import { useUnloadEventLogout, useUnloadEventOnExit } from '@pagopa/selfcare-common-frontend/hooks/useUnloadEventInterceptor';
import { ENV } from '../../utils/env';


type Props = {
  children?: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const onLogout = useUnloadEventLogout() ;
  const onExit = useUnloadEventOnExit();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header withSecondHeader={false} onExitAction={onLogout} />
      <Grid container>
        {children}
      </Grid>
      <Footer assistanceEmail={ENV.ASSISTANCE.ENABLE ? ENV.ASSISTANCE.EMAIL : undefined} onExit={onExit} />
    </Box>
  );
}
