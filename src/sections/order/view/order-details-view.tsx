'use client';

import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'src/components/snackbar';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/auth/hooks';

import OrderDetailsInfo from '../order-details-info';
import OrderDetailsItems from '../order-details-item';
import OrderDetailsToolbar from '../order-details-toolbar';
import OrderDetailsHistory from '../order-details-history';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending_order', label: 'Order' },
  { value: 'user_pending', label: 'Op klant' },
  { value: 'werkbon', label: 'Orderpicker' },
  { value: 'packing', label: 'Pakbon' }, // Verpakking
  { value: 'shipped', label: 'Verzonden' },
  { value: 'delivered', label: 'Geleverd' },
  { value: 'cancelled', label: 'Geannuleerd' },
  { value: 'refunded', label: 'Terugbetaald' },
  { value: 'pending_offer', label: 'Offer' },
  { value: 'confirmed', label: 'Bevestigd' },
  { value: 'other', label: 'Anders' },
];
export const PAYMENT_STATUS_OPTIONS = [
  { value: 'paid', label: 'Betaald' },
  { value: 'unpaid', label: 'Onbetaald' }
];

export default function OrderDetailsView({ id }: Props) {
  const [currentOrder, setCurrentOrder] = useState({});
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  useEffect(() => {
    if (id) {
      getOrder(id);
    }
  }, [id]);

  // Function to handle invoice download
  const handleDownloadDocument = async ({ doc = 'invoice' }) => {
    try {
      const initialResponse = await axiosInstance.get(`/${doc}/${id}/?all=true`, {
        responseType: 'blob',
        validateStatus: (status) => status < 400 || status === 301,
      });

      let response = initialResponse;

      // Handle 301 redirection
      if (initialResponse.status === 301) {
        const redirectedUrl = initialResponse.headers.location;
        response = await axiosInstance.get(redirectedUrl, {
          responseType: 'blob',
        });
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc}_${id}.pdf`); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      if (doc === 'invoice') {
        updateOrder(id, {
          history: [...currentOrder.history, {
            date: new Date(),
            event: `Invoice gedownload door ${user?.email}`,
          }],
          status: 'confirmed',
        });
      }
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

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
        return data;
      } else {
        // Throw an error with the response for catch block
        const error = new Error('Failed to update order');
        // @ts-ignore
        error.response = response;
        throw error;
      }
    } catch (error) {
      // Rethrow error so caller can handle it
      throw error;
    }
  };
  const sendToSnelstart = async ({ id }) => {
    try {
      const response = await axiosInstance.post(`/snelstart/`, { order_id: id });
      if (response.status === 201) {
        console.log("🚀 ~ sendToSnelstart ~ response:", response)
        enqueueSnackbar(t('Order is succesvol verzonden naar Snelstart'), { variant: 'success' });
        // updateOrder(id, {
        //   is_sent_to_snelstart: true,
        // });
      } else {
        console.error('Failed to send order to snelstart, status code:', response.status);
        enqueueSnackbar(t('Niet gelukt om deze bestelling naar Snelstart te verzenden'), { variant: 'error' });
      }
    } catch (error) {
      console.error('Error sending order to snelstart:', error);
      enqueueSnackbar(t('Niet gelukt om deze bestelling naar Snelstart te verzenden.'), { variant: 'error' });
    }
  };

  const handleChangeStatus = useCallback(
    (newValue: string) => {
      const newHistory = currentOrder.history;
      newHistory.push({
        date: new Date(),
        event: `Status gewijzigd in ${t(newValue)} door ${user?.email}`,
      });
      updateOrder(id, {
        status: newValue,
        history: newHistory,
      });
    },
    [currentOrder.history, id, t]
  );
  const onPaymentChangeStatus = useCallback(
    (newValue: string) => {
      const newHistory = currentOrder.history;
      newHistory.push({
        date: new Date(),
        event: `Betaling status gewijzigd in ${t(newValue)} door ${user?.email}`,
      });
      updateOrder(id, {
        is_paid: newValue === 'paid',
        history: newHistory,
      });
    },
    [currentOrder.history, user?.email, id, t]
  );

  if (!currentOrder) return <></>;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <OrderDetailsToolbar
        backLink={paths.dashboard.order.root}
        currentOrder={currentOrder}
        onChangeStatus={handleChangeStatus}
        onPaymentChangeStatus={onPaymentChangeStatus}
        statusOptions={ORDER_STATUS_OPTIONS}
        paymentStatusOptions={PAYMENT_STATUS_OPTIONS}
        handleDownloadDocument={handleDownloadDocument}
        sendToSnelstart={sendToSnelstart}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column', md: 'column' }}>
            <OrderDetailsItems currentOrder={currentOrder} updateOrder={updateOrder} />

            <OrderDetailsHistory currentOrder={currentOrder} />
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <OrderDetailsInfo
            currentOrder={currentOrder}
            customer={currentOrder.user || {}}
            delivery={currentOrder.delivered_date || {}}
            payment={currentOrder.payment_reference}
            shippingAddress={currentOrder.shipping_address || {}}
            updateOrder={updateOrder}
            orderId={id}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
