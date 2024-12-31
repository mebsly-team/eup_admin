import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ICampaignItem } from 'src/types/campaign';

import CampaignNewEditForm from '../campaign-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function CampaignEditView({ id }: Props) {
  const settings = useSettingsContext();
  const [currentCampaign, setCurrentCampaign] = useState<ICampaignItem>();
  const getCampaignInfo = async (campaignId: string) => {
    const { data } = await axiosInstance.get(`/campaigns/${campaignId}/?nocache=true`);
    setCurrentCampaign(data);
  };
  const { t, onChangeLang } = useTranslate();

  useEffect(() => {
    getCampaignInfo(id);
  }, [id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('edit')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('campaign'),
            href: paths.dashboard.campaign.root,
          },
          { name: currentCampaign?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentCampaign && <CampaignNewEditForm currentCampaign={currentCampaign} />}
    </Container>
  );
}
