import { Helmet } from 'react-helmet-async';

import { OrderCartsView } from 'src/sections/order/view';

export default function OrderCartsPage() {
    return (
        <>
            <Helmet>
                <title> Dashboard: Carts</title>
            </Helmet>

            <OrderCartsView />
        </>
    );
}


