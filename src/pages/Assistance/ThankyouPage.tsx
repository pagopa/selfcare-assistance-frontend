// import { Box, Button, Grid, Typography } from '@mui/material';
import CheckIllustrationIcon from '@pagopa/selfcare-common-frontend/components/icons/CheckIllustrationIcon';
import EndingPage from '@pagopa/selfcare-common-frontend/components/EndingPage';

type Props = {
  title: string;
  description: string;
  onAction?: () => void;
};
export default function ThankyouPage({ title, description, onAction }: Props) {
  return (
    <EndingPage 
      icon={<CheckIllustrationIcon />}
      title={title}
      description= {description}
      onButtonClick= {onAction}
      buttonLabel={"Chiudi"}
    />
  );
}
