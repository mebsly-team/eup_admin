import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProfileNewEditForm from '../profile-new-edit-form';

// ----------------------------------------------------------------------

export default function UserCreateView() {
  const settings = useSettingsContext();
  const { t, onChangeLang } = useTranslate();
  console.log(paths);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('Create User Profile')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('user'),
            href: paths.dashboard.user.root,
          },
          { name: t('new_user') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <ProfileNewEditForm />
    </Container>
  );
}
