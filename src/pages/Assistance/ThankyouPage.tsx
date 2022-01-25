import { Box, Button, Grid, Typography } from '@mui/material';
import ConfirmIcon from '@pagopa/selfcare-common-frontend/components/icons/ConfirmIcon';

type Props = {
  title: string;
  description: string;
  onAction?: React.MouseEventHandler<HTMLButtonElement>;
};
export default function ThankyouPage({ title, description, onAction }: Props) {
  return (
    <Grid container>
      <Box style={{ textAlign: 'center', margin: 'auto' }}>
        <Grid item xs={12}>
          <Box mb={5}>
            <ConfirmIcon />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={'h2'} mb={1}>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} mb={10}>
          <Typography variant={'body2'} sx={{ fontSize: '18px' }}>
            {description}
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{margin: 'auto'}}>
          <Button
            sx={{ width: '100%'}}
            color="primary"
            variant="contained"
            type="submit"
            onClick={onAction}
          >
            Indietro
          </Button>
        </Grid>
      </Box>
    </Grid>
  );
}
