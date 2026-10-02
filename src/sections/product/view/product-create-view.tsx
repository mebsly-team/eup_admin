import Container from '@mui/material/Container';

import ProductNewEditForm from '../product-new-edit-form';

// ----------------------------------------------------------------------

export default function ProductCreateView() {
  return (
    <Container maxWidth={false}>
      <ProductNewEditForm />
    </Container>
  );
}
