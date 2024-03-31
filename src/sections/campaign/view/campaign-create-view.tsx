import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import CampaignNewEditForm from '../campaign-new-edit-form';

// ----------------------------------------------------------------------

export default function CampaignCreateView() {
  const settings = useSettingsContext();
  const { t, onChangeLang } = useTranslate();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('create_campaign')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('campaign'),
            href: paths.dashboard.campaign.root,
          },
          { name: t('new_campaign') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CampaignNewEditForm />
    </Container>
  );
}
