import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { useSearchParams } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';

import { ICampaignItem } from 'src/types/campaign';

import CampaignNewEditForm from '../campaign-new-edit-form';

// ----------------------------------------------------------------------

export default function CampaignCreateView() {
  const settings = useSettingsContext();
  // ?from=<id> starts the new campaign as a copy of an existing one.
  const fromId = useSearchParams().get('from');
  const [template, setTemplate] = useState<ICampaignItem>();
  const [loading, setLoading] = useState(!!fromId);

  useEffect(() => {
    if (!fromId) return;
    axiosInstance
      .get(`/campaigns/${fromId}/`)
      .then(({ data }) => setTemplate(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fromId]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {loading ? <LoadingScreen /> : <CampaignNewEditForm template={template} />}
    </Container>
  );
}
