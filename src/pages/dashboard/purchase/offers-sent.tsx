import { Helmet } from 'react-helmet-async';

import PurchaseOfferSentListView from 'src/sections/purchase/view/purchase-offer-sent-list-view';

// ----------------------------------------------------------------------

export default function PurchaseOffersSentPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Sent Offers</title>
      </Helmet>

      <PurchaseOfferSentListView />
    </>
  );
}
