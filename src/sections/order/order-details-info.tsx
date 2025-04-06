/* eslint-disable no-nested-ternary */
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
import Autocomplete from '@mui/material/Autocomplete';

import axios from 'axios';
import axiosInstance from 'src/utils/axios';

import Iconify from 'src/components/iconify';

import {
  IOrderPayment,
  IOrderCustomer,
  IOrderDelivery,
  IOrderShippingAddress,
} from 'src/types/order';
import { HOST_API } from 'src/config-global';

interface IParcelType {
  key: string;
  category: string;
  minWeightKg: number;
  maxWeightKg: number;
  defaultWeightKg: number;
  dimensions: {
    maxLengthCm: number;
    maxWidthCm: number;
    maxHeightCm: number;
  };
  minWeightGrams: number;
  maxWeightGrams: number;
  defaultWeightGrams: number;
}

interface IParcelTypeOption {
  value: string;
  label: string;
}

interface IDHLPiece {
  labelId: string;
  trackerCode: string;
  parcelType: string;
  pieceNumber: number;
  weight: number;
  labelType: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

interface IDHLResponse {
  shipmentId: string;
  product: string;
  pieces: IDHLPiece[];
  orderReference: string;
  deliveryArea: {
    remote: boolean;
    type: string;
  };
}

interface IDeliveryDetails {
  shipment_id: string;
  tracking_number: string;
  parcel_type: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  postal_code: string;
}

// ----------------------------------------------------------------------

type Props = {
  customer: IOrderCustomer;
  delivery: IOrderDelivery;
  payment: IOrderPayment;
  shippingAddress: IOrderShippingAddress;
  updateOrder: any;
};

const countryOptions = [
  { label: "Nederland", value: "NL" },
  { label: "België", value: "BE" },
  { label: "Frankrijk", value: "FR" },
  { label: "Duitsland", value: "DE" },
  { label: "Verenigd Koninkrijk", value: "GB" },
];

const shipmentMethods = [
  { label: "DHL", value: "dhl" },
  { label: "Europower", value: "europower" },
];

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
  const [options, setOptions] = useState([]);

  const [addressSearchText, setAddressSearchText] = useState('');
  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState();
  const [selectedCountry, setSelectedCountry] = useState(updatedShippingAddress?.country || shippingAddress?.country || "NL");
  const [parcelTypes, setParcelTypes] = useState<IParcelTypeOption[]>([]);
  const [selectedParcelType, setSelectedParcelType] = useState('');
  const [klantType, setKlantType] = useState<'business' | 'consumer'>('business');

  const [updatedDeliveryDetails, setUpdatedDeliveryDetails] = useState<IDeliveryDetails | undefined>(undefined);
  const deliveryDetails = currentOrder?.delivery_details;
  console.log("🚀 ~ deliveryDetails:", deliveryDetails)

  useEffect(() => {
    if (deliveryDetails?.tracking_number) setUpdatedDeliveryDetails(deliveryDetails);
  }, [deliveryDetails]);

  // useEffect(() => {
  //   if (!deliveryDetails?.tracking_number) get_sendcloud_parcel_details();
  // }, [deliveryDetails?.tracking_number]);

  // const get_sendcloud_parcel_details = async () => {
  //   try {
  //     console.log('deliveryDetails', deliveryDetails);
  //     const response = await axiosInstance.get(`/get_sendcloud_parcel_details/${deliveryDetails?.id}/?nocache=true`);
  //     if (response.status === 200) {
  //       updateOrder(orderId, {
  //         delivery_details: response.data.parcel,
  //       });
  //       setUpdatedDeliveryDetails(response.data?.parcel);
  //     } else {
  //       console.error('Failed to send order:', response.status);
  //     }
  //   } catch (error) {
  //     console.error('Error sending order:', error);
  //   }
  // };

  const getParcelTypes = async () => {
    try {
      const response = await axios.get(`${HOST_API}/get_dhl_parcel_types/`, {
        params: {
          toCountry: selectedCountry,
          toPostalCode: updatedShippingAddress?.zip_code || shippingAddress?.zip_code,
          toBusiness: klantType === 'business'
        }
      });

      if (response.status === 200) {
        const parcelTypesData: IParcelType[] = response.data;
        console.log('Parcel types data:', parcelTypesData); // Debug log

        const formattedParcelTypes: IParcelTypeOption[] = parcelTypesData.map((type) => {
          // Safely access dimensions with fallback values
          const dimensions = type.dimensions || {
            maxLengthCm: 80,
            maxWidthCm: 50,
            maxHeightCm: 35
          };

          return {
            value: type.key,
            label: `${type.key} (${type.minWeightKg}-${type.maxWeightKg} kg, ${dimensions.maxLengthCm}x${dimensions.maxWidthCm}x${dimensions.maxHeightCm} cm)`
          };
        });

        setParcelTypes(formattedParcelTypes);
        if (formattedParcelTypes.length > 0) {
          setSelectedParcelType(formattedParcelTypes[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching parcel types:', error);
      // Set default parcel types if API call fails
      const defaultParcelTypes: IParcelTypeOption[] = [{
        value: 'SMALL',
        label: 'SMALL (0-2 kg, 80x50x35 cm)'
      }];
      setParcelTypes(defaultParcelTypes);
      setSelectedParcelType(defaultParcelTypes[0].value);
    }
  };

  useEffect(() => {
    if (isDeliveryEdit && selectedCountry && (updatedShippingAddress?.zip_code || shippingAddress?.zip_code)) {
      getParcelTypes();
    }
  }, [isDeliveryEdit, selectedCountry, updatedShippingAddress?.zip_code, shippingAddress?.zip_code, klantType]);

  // Function to handle address update
  const handleAddressEditClick = (e) => {
    setUpdatedShippingAddress(shippingAddress);
    setIsAddressEdit(!isAddressEdit);
  };
  // Function to handle delivery update
  const handleDeliveryEditClick = () => {
    // if (!shipmentMethods?.length) handleGetShipmentMethods();
    setIsDeliveryEdit(!isDeliveryEdit);
  };
  const handleAddressUpdate = (e) => {
    const newHistory = currentOrder.history;
    newHistory.push({
      date: new Date(),
      event: `Adres gewijzigd: ${JSON.stringify(updatedShippingAddress)}, door ${currentOrder?.shipping_address?.email || currentOrder?.user?.email
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
      const response = await axios.post(`${HOST_API}/shipment_send/${orderId}/`, {
        total_weight: totalWeight || 0.001,
        shipping_method_id: selectedShipmentMethod,
      });

      if (response.status === 200) {
        console.log('response', response);
        const newHistory = currentOrder.history;
        newHistory.push({
          date: new Date(),
          event: `Sendcloud: Totaalgewicht-${JSON.stringify(totalWeight)} - Methode-${JSON.stringify(selectedShipmentMethod)}, door ${currentOrder?.shipping_address?.email || currentOrder?.user?.email
            }`,
        });
        updateOrder(orderId, {
          delivery_details: response.data.parcel,
          history: newHistory,
        });
        setUpdatedDeliveryDetails(response.data?.parcel);
        setIsDeliveryEdit(false);
      } else {
        console.error('Failed to send order:', response.status);
      }
    } catch (error) {
      console.error('Error sending order:', error);
    }
  };

  const handleAddressFetch = async ({ searchText }: any) => {
    setAddressSearchText(searchText); // Update search text state

    // Extract 'input' query parameter
    const input = searchText;
    let country = selectedCountry;

    if (input) {
      try {
        const response = await axiosInstance.get(`/get-address-details/?input=${input}&country=${country}`);
        const data = response.data;

        // Set options from the response (matches array)
        setOptions(data.matches || []); // Store fetched matches in state
      } catch (error) {
        console.error('Error fetching address data:', error);
      }
    }
  };

  const createShipment = async () => {
    if (selectedShipmentMethod === 'dhl') {

      try {
        const response = await axios.post(`${HOST_API}/create_shipment_dhl/${orderId}/`);

        if (response.status === 200) {
          const shipmentData = response.data as IDHLResponse;

          // Validate the response structure
          if (!shipmentData || typeof shipmentData !== 'object') {
            throw new Error('Invalid response format: Response is not an object');
          }

          // Validate required fields
          if (!shipmentData.shipmentId) {
            throw new Error('Invalid response format: Missing shipmentId');
          }

          if (!Array.isArray(shipmentData.pieces) || shipmentData.pieces.length === 0) {
            throw new Error('Invalid response format: Missing or empty pieces array');
          }

          const firstPiece = shipmentData.pieces[0];
          if (!firstPiece.trackerCode) {
            throw new Error('Invalid response format: Missing trackerCode in first piece');
          }

          const newHistory = currentOrder.history;
          newHistory.push({
            date: new Date(),
            event: `DHL Shipment created: ${shipmentData.shipmentId}, Tracking: ${firstPiece.trackerCode}, door ${currentOrder?.shipping_address?.email || currentOrder?.user?.email}`,
          });

          const updatedDeliveryDetails: IDeliveryDetails = {
            shipment_id: shipmentData.shipmentId,
            tracking_number: selectedShipmentMethod === 'dhl' ? firstPiece.trackerCode : '',
            parcel_type: firstPiece.parcelType || 'SMALL',
            weight: firstPiece.weight || 0,
            dimensions: firstPiece.dimensions || { length: 30, width: 30, height: 30 },
            postal_code: shippingAddress.zip_code || '',
            carrier: selectedShipmentMethod,
          };

          updateOrder(orderId, {
            delivery_details: updatedDeliveryDetails,
            history: newHistory,
          });

          setUpdatedDeliveryDetails(updatedDeliveryDetails);
          setIsDeliveryEdit(false);
        }
      } catch (error) {
        console.error('Error creating DHL shipment:', error);
        // You might want to show an error message to the user here
        // For example, using a snackbar or alert component
      }
    } else if (selectedShipmentMethod === 'europower') {
      const newHistory = currentOrder.history;
      newHistory.push({
        date: new Date(),
        event: `Shipment door europower gemaakt`,
      });

      const updatedDeliveryDetails: IDeliveryDetails = {
        shipment_id: `Europower${orderId}`,
        tracking_number: `Europower${orderId}`,
        parcel_type: 'SMALL', // TODO
        weight: 0, // TODO
        dimensions: { length: 30, width: 30, height: 30 },  // TODO
        postal_code: shippingAddress.zip_code || '',
        carrier: 'Europower',
      };

      updateOrder(orderId, {
        delivery_details: updatedDeliveryDetails,
        history: newHistory,
      });

      setUpdatedDeliveryDetails(updatedDeliveryDetails);
      setIsDeliveryEdit(false);
    }
  };

  const handleAddressDetails = async ({ context }: any) => {
    const searchContext = context;
    if (searchContext) {
      try {
        const response = await axiosInstance.get(`/get-address-details/?context=${searchContext}`);
        const data = response.data;
        setUpdatedShippingAddress({
          ...updatedShippingAddress,
          house_number: data?.address?.buildingNumber,
          house_suffix: data?.address?.buildingNumberAddition,
          zip_code: data?.address?.postcode,
          city: data?.address?.locality,
          street_name: data?.address?.street,
          country: selectedCountry, // Country is already set in the selectedCountry state
        });
      } catch (error) {
        console.error('Error fetching address details:', error);
      }
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
          <Box sx={{ color: 'text.secondary' }}>{customer.relation_code}</Box>
          <Box>
            Betalingstermijn:
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
              {customer.payment_termin}
            </Box>
          </Box>
          <Box>
            Kredietlimiet:
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
              {customer.credit_limit}
            </Box>
          </Box>
          {/* <Box>
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
          </Button> */}
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
        {/* Carrier Select Box */}
        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Vervoerder:
          </Box>
          {isDeliveryEdit ? (
            <TextField
              size="small"
              select
              value={selectedShipmentMethod || currentOrder?.delivery_details?.carrier?.toLowerCase()}
              onChange={(e) => setSelectedShipmentMethod(e.target.value)}
              sx={{ width: 150 }}
            >
              {shipmentMethods.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            shipmentMethods.find(method => method.value === selectedShipmentMethod)?.label || currentOrder?.delivery_details?.carrier
          )}
        </Stack>

        {isDeliveryEdit ? (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Klant Type:
            </Box>
            <TextField
              size="small"
              select
              value={klantType}
              onChange={(e) => setKlantType(e.target.value as 'business' | 'consumer')}
              sx={{ width: 150 }}
            >
              <MenuItem value="business">Zakelijk</MenuItem>
              <MenuItem value="consumer">Particulier</MenuItem>
            </TextField>
          </Stack>
        ) : null}
        {isDeliveryEdit ? (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Parcel Type:
            </Box>
            <TextField
              size="small"
              select
              value={selectedParcelType}
              onChange={(e) => setSelectedParcelType(e.target.value)}
              sx={{ width: 150 }}
            >
              {parcelTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        ) : null}

        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Volgen No.
          </Box>

          {selectedShipmentMethod === 'dhl' ? (
            <Link
              href={`https://my.dhlecommerce.nl/home/tracktrace/${updatedDeliveryDetails?.tracking_number}/${updatedDeliveryDetails?.postal_code}`}
              target="_blank"
              rel="noopener"
              sx={{ ml: 0.5 }}
            >
              {updatedDeliveryDetails?.tracking_number}
            </Link>
          ) : updatedDeliveryDetails?.tracking_number}
        </Stack>
        {isDeliveryEdit ? (
          <>

            {/* Total Weight Input */}
            {/* <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Totaalgewicht (kg):
              </Box>
              <TextField
                size="small"
                type="number" : update
                value={totalWeight}
                onChange={(e) => setTotalWeight(e.target.value)}
                sx={{ width: 100 }}
              />
            </Stack> */}



            {/* Send Order Button */}
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>

              <Button variant="outlined" onClick={() => setIsDeliveryEdit(false)}>
                Annuleren
              </Button>
              <Button
                variant="contained"
                onClick={createShipment}
              // disabled={!totalWeight || !selectedShipmentMethod}
              >
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
        action={
          <IconButton onClick={handleAddressEditClick}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {isAddressEdit ? (
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Land:
              </Box>
              <TextField
                select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                sx={{ width: "auto" }}
              >
                {countryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Autocomplete
              freeSolo
              options={options} // Display matches as options
              getOptionLabel={(option: any) => option.value || ''} // Display full address in the dropdown
              onInputChange={(e, newValue) => {
                console.log("🚀 ~ newValue:", newValue)
                handleAddressFetch({ searchText: newValue })
              }} // Fetch on input change
              onChange={(e, selectedOption) => {
                console.log("🚀 ~ selectedOption:", selectedOption)
                // When an option is selected, call handleAddressDetails with the context
                handleAddressDetails({ context: selectedOption?.context });
              }}
              renderInput={(params) => <TextField {...params} label="Adres" fullWidth />}
              renderOption={(props, option: any) => (
                <li {...props}>
                  {option.value} {/* Display full address in the dropdown */}
                </li>
              )}
            />

            <Box component="span" sx={{ color: 'text.secondary', width: "auto", flexShrink: 0 }}>
              {`${updatedShippingAddress.street_name} ${updatedShippingAddress.house_number} ${updatedShippingAddress.house_suffix}, ${updatedShippingAddress.zip_code}, ${updatedShippingAddress.city}, ${updatedShippingAddress.country}`}
            </Box>

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
              {shippingAddress.street_name || ''} {shippingAddress.house_number || ''}{' '}
              {shippingAddress.house_suffix || ''}
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

      {renderShipping}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderDelivery}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderPayment}
    </Card>
  );
}
