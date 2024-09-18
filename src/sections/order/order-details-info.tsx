import { useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import axiosInstance from 'src/utils/axios';

import Iconify from 'src/components/iconify';

import {
  IOrderPayment,
  IOrderCustomer,
  IOrderDelivery,
  IOrderShippingAddress,
} from 'src/types/order';

// ----------------------------------------------------------------------

type Props = {
  customer: IOrderCustomer;
  delivery: IOrderDelivery;
  payment: IOrderPayment;
  shippingAddress: IOrderShippingAddress;
  updateOrder: any;
};

const carriers = [
  { value: 'DHL', label: 'DHL' },
  { value: 'POSTNL', label: 'POSTNL' },
  { value: 'DPD', label: 'DPD' },
];

export default function OrderDetailsInfo({
  customer,
  delivery,
  payment,
  shippingAddress,
  updateOrder,
}: Props) {
  const [isDeliveryEdit, setIsDeliveryEdit] = useState(false);
  const [totalWeight, setTotalWeight] = useState('');
  const [carrier, setCarrier] = useState('');

  const handleSendOrder = async () => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/send`, {
        carrier,
        totalWeight,
      });

      if (response.status === 200) {
        alert('Order sent successfully');
      } else {
        console.error('Failed to send order:', response.status);
      }
    } catch (error) {
      console.error('Error sending order:', error);
    }
  };

  const renderCustomer = (
    <>
      <CardHeader
        title="Klanten info"
        // action={
        //   <IconButton>
        //     <Iconify icon="solar:pen-bold" />
        //   </IconButton>
        // }
      />
      <Stack direction="row" sx={{ p: 3 }}>
        <Avatar
          alt={customer.name}
          src={customer.avatarUrl}
          sx={{ width: 48, height: 48, mr: 2 }}
        />

        <Stack spacing={0.5} alignItems="flex-start" sx={{ typography: 'body2' }}>
          <Typography variant="subtitle2">{customer.name}</Typography>

          <Box sx={{ color: 'text.secondary' }}>{customer.email}</Box>

          <Box>
            IP Adres:
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
              {customer.ipAddress}
            </Box>
          </Box>

          <Button
            size="small"
            color="error"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ mt: 1 }}
          >
            Toevoegen aan zwarte lijst
          </Button>
        </Stack>
      </Stack>
    </>
  );

  const renderDelivery = (
    <>
      <CardHeader
        title="Levering"
        action={
          <IconButton onClick={() => setIsDeliveryEdit(!isDeliveryEdit)}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Verzonden door:
          </Box>
          {delivery.shipBy}
        </Stack>

        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Volgen No.
          </Box>
          <Link underline="always" color="inherit">
            {delivery.trackingNumber}
          </Link>
        </Stack>
        {isDeliveryEdit ? (
          <>
            {/* Total Weight Input */}
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Totaalgewicht (kg):
              </Box>
              <TextField
                type="number"
                value={totalWeight}
                onChange={(e) => setTotalWeight(e.target.value)}
                sx={{ width: 100 }}
              />
            </Stack>

            {/* Carrier Select Box */}
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Vervoerder:
              </Box>
              <TextField
                select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                sx={{ width: 150 }}
              >
                {carriers.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Send Order Button */}
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleSendOrder}>
                Stuur
              </Button>
            </Stack>
          </>
        ) : null}
      </Stack>
    </>
  );

  const renderShipping = (
    <>
      <CardHeader
        title="Verzending"
        // action={
        //   <IconButton>
        //     <Iconify icon="solar:pen-bold" />
        //   </IconButton>
        // }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Adres
          </Box>
          {shippingAddress.line1 || ''}
          <br />
          {`${shippingAddress.zip_code || ''} ${shippingAddress.city || ''}`}
          <br />
          {shippingAddress.country || ''}
        </Stack>

        <Stack direction="row">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Telefoonnummer
          </Box>
          {shippingAddress.phone_number}
        </Stack>
      </Stack>
    </>
  );

  const renderPayment = (
    <>
      <CardHeader
        title="Betaling"
        // action={
        //   <IconButton>
        //     <Iconify icon="solar:pen-bold" />
        //   </IconButton>
        // }
      />
      <Stack direction="row" alignItems="center" sx={{ p: 3, typography: 'body2' }}>
        <Box component="span" sx={{ color: 'text.secondary', flexGrow: 1 }}>
          Betalingsverwijzing
        </Box>
        <Link
          href={`https://my.mollie.com/dashboard/${'org_1065131'}/payments/${payment}`}
          variant="body2"
          target="_blank"
          rel="noopener"
          sx={{ cursor: 'pointer' }}
        >
          {payment}
        </Link>
        {/* <Iconify icon="logos:mastercard" width={24} sx={{ ml: 0.5 }} /> */}
      </Stack>
    </>
  );

  return (
    <Card>
      {renderCustomer}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderDelivery}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderShipping}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderPayment}
    </Card>
  );
}
