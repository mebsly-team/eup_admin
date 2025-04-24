import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import PurchaseEditView from 'src/sections/purchase/view/purchase-edit-view';

// ----------------------------------------------------------------------

export default function PurchaseEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: purchase Edit</title>
      </Helmet>

      <PurchaseEditView id={`${id}`} />
    </>
  );
}
