'use client';

import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';

import OrderDetailsInfo from '../order-details-info';
import OrderDetailsItems from '../order-details-item';
import OrderDetailsToolbar from '../order-details-toolbar';
import OrderDetailsHistory from '../order-details-history';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending_order', label: 'In order' },
  { value: 'pending_offer', label: 'In offerte' },
  { value: 'confirmed', label: 'Bevestigd' },
  { value: 'werkbon', label: 'Order Picker' },
  { value: 'packing', label: 'Pakbon' }, // Verpakking
  { value: 'shipped', label: 'Verzonden' },
  { value: 'delivered', label: 'Geleverd' },
  { value: 'cancelled', label: 'Geannuleerd' },
  { value: 'refunded', label: 'Terugbetaald' },
  { value: 'other', label: 'Anders' },
];

export default function OrderDetailsView({ id }: Props) {
  const [currentOrder, setCurrentOrder] = useState({});
  const settings = useSettingsContext();

  useEffect(() => {
    if (id) {
      getOrder(id);
    }
  }, [id]);

  const getOrder = async (orderId: string) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/?all=true`);
      if (response.status === 200) {
        const { data } = response;
        setCurrentOrder(data || {});
      } else {
        console.error('Failed to fetch order, status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const updateOrder = async (orderId: string, data: any) => {
    try {
      const response = await axiosInstance.patch(`/orders/${orderId}/`, data);
      if (response.status === 200) {
        const { data } = response;
        setCurrentOrder(data || {});
      } else {
        console.error('Failed to fetch order, status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const handleChangeStatus = useCallback((newValue: string) => {
    updateOrder(id, { status: newValue });
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <OrderDetailsToolbar
        backLink={paths.dashboard.order.root}
        currentOrder={currentOrder}
        onChangeStatus={handleChangeStatus}
        statusOptions={ORDER_STATUS_OPTIONS}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            <OrderDetailsItems currentOrder={currentOrder} />

            <OrderDetailsHistory currentOrder={currentOrder} />
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <OrderDetailsInfo
            customer={currentOrder.user || {}}
            delivery={currentOrder.delivered_date || {}}
            payment={currentOrder.payment_reference}
            shippingAddress={currentOrder.shipping_address || {}}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
