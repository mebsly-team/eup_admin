import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';

import { PurchaseOfferView } from 'src/sections/purchase/purchase-offer-view';

// ----------------------------------------------------------------------

export default function PurchaseOfferPage() {
  const params = useParams();

  const { id } = params;
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new offer</title>
      </Helmet>

      <PurchaseOfferView id={`${id}`} />
    </>
  );
}
