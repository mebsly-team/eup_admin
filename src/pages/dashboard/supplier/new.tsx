import { Helmet } from 'react-helmet-async';

import { SupplierCreateView } from 'src/sections/supplier/view';

// ----------------------------------------------------------------------

export default function SupplierCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Supplier</title>
      </Helmet>

      <SupplierCreateView />
    </>
  );
}
