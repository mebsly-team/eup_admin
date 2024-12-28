import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../user-new-edit-form';

// ----------------------------------------------------------------------

export default function UserCreateView() {
  const settings = useSettingsContext();
  const { t, onChangeLang } = useTranslate();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('create_employee')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.employee.list,
          },
          {
            name: t('employee'),
            href: paths.dashboard.employee.list,
          },
          { name: t('new_employee') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <UserNewEditForm />
    </Container>
  );
}
