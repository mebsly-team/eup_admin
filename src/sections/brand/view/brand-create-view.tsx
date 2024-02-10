import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import BrandNewEditForm from '../brand-new-edit-form';

// ----------------------------------------------------------------------

export default function BrandCreateView() {
  const settings = useSettingsContext();
  const { t, onChangeLang } = useTranslate();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('create_brand')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('brand'),
            href: paths.dashboard.brand.root,
          },
          { name: t('new_brand') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BrandNewEditForm />
    </Container>
  );
}
