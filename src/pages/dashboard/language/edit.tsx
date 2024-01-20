import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { LanguageEditView } from 'src/sections/language/view';
// ----------------------------------------------------------------------

export default function LanguageEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Language Edit</title>
      </Helmet>

      <LanguageEditView id={`${id}`} />
    </>
  );
}
