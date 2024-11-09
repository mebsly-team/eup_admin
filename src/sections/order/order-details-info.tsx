import { useState, useEffect } from 'react';

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

export default function OrderDetailsInfo({
  customer,
  delivery,
  payment,
  shippingAddress,
  updateOrder,
  orderId,
  currentOrder,
}: Props) {
  const [updatedShippingAddress, setUpdatedShippingAddress] = useState(shippingAddress);
  const [isDeliveryEdit, setIsDeliveryEdit] = useState(false);
  const [isAddressEdit, setIsAddressEdit] = useState(false);
  const [totalWeight, setTotalWeight] = useState('');
  const [shipmentMethods, setShipmentMethods] = useState([]);
  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState();
  const [updatedDeliveryDetails, setUpdatedDeliveryDetails] = useState();
  const deliveryDetails = currentOrder?.delivery_details;

  useEffect(() => {
    if (deliveryDetails?.id) setUpdatedDeliveryDetails(updatedDeliveryDetails);
    if (deliveryDetails?.id && !deliveryDetails?.tracking_number) getParcelDetails();
  }, [deliveryDetails]);

  const getParcelDetails = async () => {
    try {
      console.log('deliveryDetails', deliveryDetails);
      const response = await axiosInstance.get(`/get_parcel_details/${deliveryDetails?.id}/`);
      if (response.status === 200) {
        setUpdatedDeliveryDetails(response.data?.parcel);
      } else {
        console.error('Failed to send order:', response.status);
      }
    } catch (error) {
      console.error('Error sending order:', error);
    }
  };
  const handleGetShipmentMethods = async () => {
    try {
      const response = await axiosInstance.get(`/get_sendcloud_shipment_methods/`);

      if (response.status === 200) {
        setShipmentMethods(
          response.data?.shipping_methods?.map((item) => {
            const countryData = item.countries.find(
              (c) =>
                c.iso_2 === updatedShippingAddress?.country || c.iso_2 === shippingAddress?.country
            );
            return {
              value: item.id,
              label: `${item.name} - (€${countryData?.price || '-'}) - (${item?.min_weight}-${item?.max_weight} kg)`,
            };
          })
        );
      } else {
        console.error('Failed to send order:', response.status);
      }
    } catch (error) {
      console.error('Error sending order:', error);
    }
  };

  // Function to handle address update
  const handleAddressEditClick = (e) => {
    setUpdatedShippingAddress(shippingAddress);
    setIsAddressEdit(!isAddressEdit);
  };
  // Function to handle delivery update
  const handleDeliveryEditClick = () => {
    if (!shipmentMethods?.length) handleGetShipmentMethods();
    setIsDeliveryEdit(!isDeliveryEdit);
  };
  const handleAddressUpdate = (e) => {
    const newHistory = currentOrder.history;
    newHistory.push({
      date: new Date(),
      event: `Adres gewijzigd: ${JSON.stringify(updatedShippingAddress)}, door ${
        currentOrder?.shipping_address?.email || currentOrder?.user?.email
      }`,
    });
    updateOrder(orderId, {
      shipping_address: { ...shippingAddress, ...updatedShippingAddress },
      history: newHistory,
    });
    setIsAddressEdit(false);
  };

  const handleSendToSendCloud = async () => {
    try {
      const response = await axiosInstance.post(`/shipment_send/${orderId}/`, {
        total_weight: totalWeight || 0.001,
        shipping_method_id: selectedShipmentMethod,
      });

      if (response.status === 200) {
        console.log('response', response);
        const newHistory = currentOrder.history;
        newHistory.push({
          date: new Date(),
          event: `Sendcloud: Totaalgewicht-${JSON.stringify(totalWeight)} - Methode-${JSON.stringify(selectedShipmentMethod)}, door ${
            currentOrder?.shipping_address?.email || currentOrder?.user?.email
          }`,
        });
        updateOrder(orderId, {
          delivery_details: response.data.parcel,
          history: newHistory,
        });
        setIsDeliveryEdit(false);
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
          <IconButton onClick={handleDeliveryEditClick}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Verzonden Methode:
          </Box>
          {updatedDeliveryDetails?.shipment?.name}
        </Stack>

        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Volgen No.
          </Box>
          <Link underline="always" color="inherit">
            {updatedDeliveryDetails?.tracking_number}
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
                value={selectedShipmentMethod}
                onChange={(e) => setSelectedShipmentMethod(e.target.value)}
                sx={{ width: 150 }}
              >
                {shipmentMethods.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Send Order Button */}
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleSendToSendCloud}>
                Stuur
              </Button>
              <Button variant="outlined" onClick={() => setIsDeliveryEdit(false)}>
                Annuleren
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
        action={
          <IconButton onClick={handleAddressEditClick}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {isAddressEdit ? (
          <Stack spacing={1.5}>
            <TextField
              label="Adres"
              value={updatedShippingAddress.line1}
              onChange={(e) =>
                setUpdatedShippingAddress({ ...updatedShippingAddress, line1: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Postcode"
              value={updatedShippingAddress.zip_code}
              onChange={(e) =>
                setUpdatedShippingAddress({ ...updatedShippingAddress, zip_code: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Stad"
              value={updatedShippingAddress.city}
              onChange={(e) =>
                setUpdatedShippingAddress({ ...updatedShippingAddress, city: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Land"
              value={updatedShippingAddress.country}
              onChange={(e) =>
                setUpdatedShippingAddress({ ...updatedShippingAddress, country: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Telefoonnummer"
              value={updatedShippingAddress.phone_number}
              onChange={(e) =>
                setUpdatedShippingAddress({
                  ...updatedShippingAddress,
                  phone_number: e.target.value,
                })
              }
              fullWidth
            />
            <Stack direction="row" spacing={1}>
              <Button onClick={handleAddressUpdate} variant="contained">
                Opslaan
              </Button>
              <Button variant="outlined" onClick={() => setIsAddressEdit(false)}>
                Annuleren
              </Button>
            </Stack>
          </Stack>
        ) : (
          <>
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
          </>
        )}
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
