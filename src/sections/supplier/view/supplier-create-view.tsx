import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import SupplierNewEditForm from '../supplier-new-edit-form';

// ----------------------------------------------------------------------

export default function SupplierCreateView() {
  const settings = useSettingsContext();
  const { t, onChangeLang } = useTranslate();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('create_supplier')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('supplier'),
            href: paths.dashboard.supplier.root,
          },
          { name: t('new_supplier') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <SupplierNewEditForm />
    </Container>
  );
}
