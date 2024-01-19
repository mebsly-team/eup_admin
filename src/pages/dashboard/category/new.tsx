import { Helmet } from 'react-helmet-async';

import { CategoryCreateView } from 'src/sections/category/view';

// ----------------------------------------------------------------------

export default function CategoryCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Category</title>
      </Helmet>

      <CategoryCreateView />
    </>
  );
}
