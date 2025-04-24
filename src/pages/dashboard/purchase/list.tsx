import { Helmet } from 'react-helmet-async';

import { PurchaseListView } from 'src/sections/purchase/view';

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Statics</title>
      </Helmet>

      <PurchaseListView />
    </>
  );
}
