import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ILanguageItem } from 'src/types/language';

import LanguageNewEditForm from '../language-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function LanguageEditView({ id }: Props) {
  const settings = useSettingsContext();
  const [currentLanguage, setCurrentLanguage] = useState<ILanguageItem>();
  const getLanguageInfo = async (languageId: string) => {
    const { data } = await axiosInstance.get(`/language/${languageId}/?nocache=true`);
    setCurrentLanguage(data);
  };
  const { t, onChangeLang } = useTranslate();
  useEffect(() => {
    getLanguageInfo(id);
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
            name: t('language'),
            href: paths.dashboard.language.root,
          },
          { name: currentLanguage?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentLanguage && <LanguageNewEditForm currentLanguage={currentLanguage} />}
    </Container>
  );
}
