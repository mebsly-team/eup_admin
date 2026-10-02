import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axiosInstance from 'src/utils/axios';

import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';

import { ICampaignItem } from 'src/types/campaign';

import CampaignNewEditForm from '../campaign-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function CampaignEditView({ id }: Props) {
  const settings = useSettingsContext();
  const [currentCampaign, setCurrentCampaign] = useState<ICampaignItem>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentCampaign(undefined);
    setFailed(false);
    axiosInstance
      .get(`/campaigns/${id}/`)
      .then(({ data }) => setCurrentCampaign(data))
      .catch((error) => {
        console.error(error);
        setFailed(true);
      });
  }, [id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {!currentCampaign && !failed && <LoadingScreen />}
      {failed && (
        <EmptyContent
          filled
          title="Actie niet gevonden"
          action={
            <Button component={RouterLink} href={paths.dashboard.campaign.root} sx={{ mt: 2 }}>
              Terug naar de lijst
            </Button>
          }
          sx={{ py: 10 }}
        />
      )}
      {currentCampaign && <CampaignNewEditForm key={currentCampaign.id} currentCampaign={currentCampaign} />}
    </Container>
  );
}
