import { Helmet } from 'react-helmet-async';

import { SupplierListView } from 'src/sections/supplier/view';
// ----------------------------------------------------------------------

export default function SupplierListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: supplier List</title>
      </Helmet>

      <SupplierListView />
    </>
  );
}
