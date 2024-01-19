import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import BrandNewEditForm from '../brand-new-edit-form';

// ----------------------------------------------------------------------

export default function BrandCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new brand"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Brand',
            href: paths.dashboard.brand.root,
          },
          { name: 'New brand' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BrandNewEditForm />
    </Container>
  );
}
