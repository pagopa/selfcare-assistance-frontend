// import { Box, Button, Grid, Typography } from '@mui/material';
import CheckIllustrationIcon from '@pagopa/selfcare-common-frontend/components/icons/CheckIllustrationIcon';
import EndingPage from '@pagopa/selfcare-common-frontend/components/EndingPage';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  description: string;
  onAction?: () => void;
};
export default function ThankyouPage({ title, description, onAction }: Props) {
  const { t } = useTranslation();
  return (
    <EndingPage
      icon={<CheckIllustrationIcon />} // TODO: sostituire icona con quella presente in materil
      title={title}
      description={description}
      onButtonClick={onAction}
      buttonLabel={t('thankyouPage.buttonLabel')}
      // variantTitle={'h4'}
      // variantDescription={'body1'}
    />
  );
}
