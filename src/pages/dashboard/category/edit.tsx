import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CategoryEditView } from 'src/sections/category/view';
// ----------------------------------------------------------------------

export default function CategoryEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Category Edit</title>
      </Helmet>

      <CategoryEditView id={`${id}`} />
    </>
  );
}
