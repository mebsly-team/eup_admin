import { Helmet } from 'react-helmet-async';

import { BrandListView } from 'src/sections/brand/view';
// ----------------------------------------------------------------------

export default function BrandListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Brand List</title>
      </Helmet>

      <BrandListView />
    </>
  );
}
