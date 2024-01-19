import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { SupplierEditView } from 'src/sections/supplier/view';
// ----------------------------------------------------------------------

export default function CategoryEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Category Edit</title>
      </Helmet>

      <SupplierEditView id={`${id}`} />
    </>
  );
}
