import { Helmet } from 'react-helmet-async';

import { LanguageCreateView } from 'src/sections/language/view';

// ----------------------------------------------------------------------

export default function LanguageCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new language</title>
      </Helmet>

      <LanguageCreateView />
    </>
  );
}
