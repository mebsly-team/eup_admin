import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { BrandEditView } from 'src/sections/brand/view';
// ----------------------------------------------------------------------

export default function BrandEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Dashboard: Brand Edit</title>
      </Helmet>

      <BrandEditView id={`${id}`} />
    </>
  );
}
