import { Helmet } from 'react-helmet-async';

import { PurchaseCreateView } from 'src/sections/purchase/view';

// ----------------------------------------------------------------------

export default function PurchaseCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new purchase</title>
      </Helmet>

      <PurchaseCreateView />
    </>
  );
}
