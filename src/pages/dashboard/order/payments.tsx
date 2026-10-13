import { Helmet } from 'react-helmet-async';

import { OrderPaymentsView } from 'src/sections/order/view';

export default function OrderPaymentsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Betalingen</title>
      </Helmet>

      <OrderPaymentsView />
    </>
  );
}
