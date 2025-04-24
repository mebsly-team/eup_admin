import { Container } from '@mui/material';

import PurchaseNewEditForm from '../purchase-new-edit-form';

export default function PurchaseCreateView() {
  return (
    <Container maxWidth={false}>
      <PurchaseNewEditForm />
    </Container>
  );
}
