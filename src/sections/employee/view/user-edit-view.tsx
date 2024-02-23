import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IUserItem } from 'src/types/user';

import UserNewEditForm from '../user-new-edit-form';
// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function UserEditView({ id }: Props) {
  const settings = useSettingsContext();
  const [currentUser, setCurrentUser] = useState<IUserItem>();
  const getUserInfo = async (userId) => {
    const { data } = await axiosInstance.get(`/users/${userId}/`);
    setCurrentUser(data);
  };
  const { t, onChangeLang } = useTranslate();

  useEffect(() => {
    getUserInfo(id);
  }, [id]);

  // const currentUser = _userList.find((user) => user.id === id);

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
            name: t('employee'),
            href: paths.dashboard.employee.root,
          },
          { name: currentUser?.first_name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentUser && <UserNewEditForm currentUser={currentUser} />}
    </Container>
  );
}
