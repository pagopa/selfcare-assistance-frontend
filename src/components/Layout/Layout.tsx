import { Grid } from '@mui/material';
import { Box } from '@mui/system';
import { Footer, Header } from '@pagopa/selfcare-common-frontend';
import React from 'react';
import { ENV } from '../../utils/env';


type Props = {
  children?: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header withSecondHeader={false} />
      <Grid container direction="row" flexGrow={1}>
        {children}
      </Grid>
      <Footer assistanceEmail={ENV.ASSISTANCE.ENABLE ? ENV.ASSISTANCE.EMAIL : undefined} />
    </Box>
  );
}
