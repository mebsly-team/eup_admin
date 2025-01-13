import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useEffect, useState } from 'react';
import { IUserItem } from 'src/types/user';
import axiosInstance from 'src/utils/axios';
import ProfileNewEditForm from '../profile-new-edit-form';

// ----------------------------------------------------------------------


export default function UserProfileView() {
  const settings = useSettingsContext();
  const [currentUser, setCurrentUser] = useState<IUserItem>();
  const { t, onChangeLang } = useTranslate();
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('update_user_profile')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('user'),
            href: paths.dashboard.user.root,
          },
          { name: currentUser?.first_name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <ProfileNewEditForm />
    </Container>
  );
}