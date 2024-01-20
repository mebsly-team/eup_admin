import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import LanguageNewEditForm from '../language-new-edit-form';

// ----------------------------------------------------------------------

export default function LanguageCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new language
        "
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Language',
            href: paths.dashboard.language.root,
          },
          { name: 'New language' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <LanguageNewEditForm />
    </Container>
  );
}
