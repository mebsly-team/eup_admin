import { Helmet } from 'react-helmet-async';

import PurchaseOffersListView from 'src/sections/purchase/view/purchase-offer-list-view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Purchases</title>
      </Helmet>

      <PurchaseOffersListView />
    </>
  );
}
