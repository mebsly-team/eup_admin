import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import LanguageNewEditForm from '../language-new-edit-form';

// ----------------------------------------------------------------------

export default function LanguageCreateView() {
  const settings = useSettingsContext();
  const { t, onChangeLang } = useTranslate();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('create_language')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('language'),
            href: paths.dashboard.language.root,
          },
          { name: t('new_language') },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <LanguageNewEditForm />
    </Container>
  );
}
