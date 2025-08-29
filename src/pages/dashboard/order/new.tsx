import { lazy } from 'react';

const OrderCreateView = lazy(() => import('src/sections/order/view/order-create-view'));

export default function OrderCreatePage() {
    return <OrderCreateView />;
} 