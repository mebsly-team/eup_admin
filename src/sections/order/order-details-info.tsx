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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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
import { useAuthContext } from 'src/auth/hooks';

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
  carrier?: string;
}

// ----------------------------------------------------------------------

type Props = {
  customer: IOrderCustomer;
  delivery: IOrderDelivery;
  payment: IOrderPayment;
  shippingAddress: IOrderShippingAddress;
  invoiceAddress?: IOrderShippingAddress;
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
  { label: "DPD", value: "dpd" },
];

const formatAddress = (addr: any) => {
  if (!addr) return '';
  const street = addr.street_name || '';
  const house = addr.house_number || '';
  const suffix = addr.house_suffix ? ` ${addr.house_suffix}` : '';
  const zip = addr.zip_code || '';
  const city = addr.city || '';
  const country = typeof addr.country === 'object' ? addr.country?.code || '' : addr.country || '';
  const business = addr.business_name ? `${addr.business_name}, ` : '';
  const name = addr.first_name || addr.last_name ? `${addr.first_name || ''} ${addr.last_name || ''}, ` : '';
  return `${name}${business}${street} ${house}${suffix}, ${zip} ${city}, ${country}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, '').replace(/ ,/g, ',');
};

export default function OrderDetailsInfo({
  customer,
  delivery,
  payment,
  shippingAddress,
  invoiceAddress,
  updateOrder,
  orderId,
  currentOrder,
}: Props) {
  console.log("🚀 ~ customer:", customer)
  const { user } = useAuthContext();
  const [updatedShippingAddress, setUpdatedShippingAddress] = useState(shippingAddress);
  const [updatedInvoiceAddress, setUpdatedInvoiceAddress] = useState(invoiceAddress || {});
  const [isDeliveryEdit, setIsDeliveryEdit] = useState(false);
  const [isAddressEdit, setIsAddressEdit] = useState(false);
  const [isInvoiceAddressEdit, setIsInvoiceAddressEdit] = useState(false);
  
  const [shippingAddressSource, setShippingAddressSource] = useState<string>('order');
  const [invoiceAddressSource, setInvoiceAddressSource] = useState<string>('order');

  const [isInvoiceDateEdit, setIsInvoiceDateEdit] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(null);
  const [totalWeight, setTotalWeight] = useState('');
  const [options, setOptions] = useState([]);

  const [addressSearchText, setAddressSearchText] = useState('');
  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState();
  console.log("🚀 ~ selectedShipmentMethod:", selectedShipmentMethod)
  const [selectedCountry, setSelectedCountry] = useState(updatedShippingAddress?.country || shippingAddress?.country || "NL");
  const [parcelTypes, setParcelTypes] = useState<IParcelTypeOption[]>([]);
  const [selectedParcelType, setSelectedParcelType] = useState('');
  console.log("🚀 ~ selectedParcelType:", selectedParcelType)
  const [klantType, setKlantType] = useState<'business' | 'consumer'>('business');
  const [autoCalculateParcel, setAutoCalculateParcel] = useState(false);

  const [updatedDeliveryDetails, setUpdatedDeliveryDetails] = useState<IDeliveryDetails | undefined>(undefined);
  const [editableTrackingNumber, setEditableTrackingNumber] = useState('');
  const deliveryDetails = currentOrder?.delivery_details;
  console.log("🚀 ~ deliveryDetails:", deliveryDetails)

  useEffect(() => {
    if (deliveryDetails?.tracking_number) setUpdatedDeliveryDetails(deliveryDetails);
  }, [deliveryDetails]);

  useEffect(() => {
    if (currentOrder?.invoice_date) {
      setInvoiceDate(new Date(currentOrder.invoice_date));
    }
  }, [currentOrder?.invoice_date]);

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
    setShippingAddressSource('order');
    setIsAddressEdit(!isAddressEdit);
  };
  const handleInvoiceAddressEditClick = (e) => {
    setUpdatedInvoiceAddress(invoiceAddress || {});
    setInvoiceAddressSource('order');
    setIsInvoiceAddressEdit(!isInvoiceAddressEdit);
  };
  // Function to handle delivery update
  const handleDeliveryEditClick = () => {
    // if (!shipmentMethods?.length) handleGetShipmentMethods();
    setIsDeliveryEdit(!isDeliveryEdit);
  };

  // Function to handle invoice date edit
  const handleInvoiceDateEditClick = () => {
    setIsInvoiceDateEdit(!isInvoiceDateEdit);
  };

  // Function to handle invoice date update
  const handleInvoiceDateUpdate = () => {
    const newHistory = currentOrder.history;
    newHistory.push({
      date: new Date(),
      event: `Factuurdatum gewijzigd naar ${invoiceDate?.toLocaleDateString('nl-NL')} door ${user?.email}`,
    });

    let formattedDate = '';
    if (invoiceDate) {
      const year = invoiceDate.getFullYear();
      const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
      const day = String(invoiceDate.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }

    updateOrder(orderId, {
      invoice_date: formattedDate,
      history: newHistory,
    });
    setIsInvoiceDateEdit(false);
  };
  const handleAddressUpdate = (e) => {
    let addressToSave: any = {};
    if (shippingAddressSource === 'order') {
      addressToSave = shippingAddress;
    } else if (shippingAddressSource === 'other') {
      addressToSave = updatedShippingAddress;
    } else {
      addressToSave = (customer as any)?.addresses?.find((a: any) => a.id === shippingAddressSource) || {};
    }

    const newHistory = currentOrder.history;
    newHistory.push({
      date: new Date(),
      event: `Adres gewijzigd: ${JSON.stringify(addressToSave)}, door ${user?.email}`,
    });
    console.log("🚀 ~ handleAddressUpdate ~ shipping_address before update:", { ...shippingAddress })
    console.log("🚀 ~ handleAddressUpdate ~ shipping_address after update:", { ...shippingAddress, ...addressToSave })
    updateOrder(orderId, {
      shipping_address: { ...shippingAddress, ...addressToSave },
      history: newHistory,
    });
    setIsAddressEdit(false);
  };

  const handleInvoiceAddressUpdate = (e) => {
    let addressToSave: any = {};
    if (invoiceAddressSource === 'order') {
      addressToSave = invoiceAddress;
    } else if (invoiceAddressSource === 'other') {
      addressToSave = updatedInvoiceAddress;
    } else {
      addressToSave = (customer as any)?.addresses?.find((a: any) => a.id === invoiceAddressSource) || {};
    }

    const newHistory = currentOrder.history;
    newHistory.push({
      date: new Date(),
      event: `Factuuradres gewijzigd: ${JSON.stringify(addressToSave)}, door ${user?.email}`,
    });
    updateOrder(orderId, {
      invoice_address: { ...invoiceAddress, ...addressToSave },
      history: newHistory,
    });
    setIsInvoiceAddressEdit(false);
  };

  // const handleSendToSendCloud = async () => {
  //   try {
  //     const response = await axios.post(`${HOST_API}/shipment_send/${orderId}/`, {
  //       total_weight: totalWeight || 0.001,
  //       shipping_method_id: selectedShipmentMethod,
  //     });

  //     if (response.status === 200) {
  //       console.log('response', response);
  //       const newHistory = currentOrder.history;
  //       newHistory.push({
  //         date: new Date(),
  //         event: `Sendcloud: Totaalgewicht-${JSON.stringify(totalWeight)} - Methode-${JSON.stringify(selectedShipmentMethod)}, door ${currentOrder?.shipping_address?.email || currentOrder?.user?.email
  //           }`,
  //       });
  //       updateOrder(orderId, {
  //         delivery_details: response.data.parcel,
  //         history: newHistory,
  //       });
  //       setUpdatedDeliveryDetails(response.data?.parcel);
  //       setIsDeliveryEdit(false);
  //     } else {
  //       console.error('Failed to send order:', response.status);
  //     }
  //   } catch (error) {
  //     console.error('Error sending order:', error);
  //   }
  // };

  const handleAddressFetch = async ({ searchText, country }: any) => {
    setAddressSearchText(searchText);
    const input = searchText;
    const selected = country || selectedCountry;

    if (input) {
      try {
        const response = await axiosInstance.get(`/get-address-details/?input=${input}&country=${selected}`);
        const data = response.data;
        setOptions(data.matches || []);
      } catch (error) {
        console.error('Error fetching address data:', error);
      }
    }
  };

  const createShipment = async () => {
    if (selectedShipmentMethod === 'dhl') {
      try {
        const response = await axios.post(`${HOST_API}/create_shipment_dhl/${orderId}/`, {
          auto_calculate: autoCalculateParcel,
          parcel_type: selectedParcelType
        });

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
            event: `DHL Shipment created: ${shipmentData.shipmentId}, Tracking: ${firstPiece.trackerCode}, door ${user?.email}`,
          });

          const updatedDeliveryDetails: IDeliveryDetails = {
            shipment_id: shipmentData.shipmentId,
            tracking_number: selectedShipmentMethod === 'dhl' ? firstPiece.trackerCode : '',
            parcel_type: firstPiece.parcelType || 'SMALL',
            weight: firstPiece.weight || 0,
            dimensions: firstPiece.dimensions || { length: 30, width: 30, height: 30 },
            postal_code: (shippingAddress.zip_code as string) || '',
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
        event: `Shipment: Europower gemaakt door ${user?.email}`,
      });

      const updatedDeliveryDetails: IDeliveryDetails = {
        shipment_id: editableTrackingNumber || `Europower${orderId}`,
        tracking_number: editableTrackingNumber || `Europower${orderId}`,
        parcel_type: 'SMALL', // TODO
        weight: 0, // TODO
        dimensions: { length: 30, width: 30, height: 30 },  // TODO
        postal_code: (shippingAddress.zip_code as string) || '',
        carrier: 'Europower',
      };

      updateOrder(orderId, {
        delivery_details: updatedDeliveryDetails,
        history: newHistory,
      });

      setUpdatedDeliveryDetails(updatedDeliveryDetails);
      setIsDeliveryEdit(false);
    } else if (selectedShipmentMethod === 'dpd') {
      const newHistory = currentOrder.history;
      newHistory.push({
        date: new Date(),
        event: `Shipment: DPD gemaakt door ${user?.email}`,
      });

      const updatedDeliveryDetails: IDeliveryDetails = {
        shipment_id: `DPD${orderId}`,
        tracking_number: editableTrackingNumber || `DPD${orderId}`,
        parcel_type: 'SMALL',
        weight: 0,
        dimensions: { length: 30, width: 30, height: 30 },
        postal_code: (shippingAddress.zip_code as string) || '',
        carrier: 'DPD',
      };

      updateOrder(orderId, {
        delivery_details: updatedDeliveryDetails,
        history: newHistory,
      });

      setUpdatedDeliveryDetails(updatedDeliveryDetails);
      setEditableTrackingNumber('');
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
          <Typography variant="subtitle2">{customer.business_name}</Typography>
          <Typography variant="subtitle2">{customer.name}</Typography>

          <Link
            href={`/dashboard/user/${customer.id}/edit`}
            target="_blank"
            rel="noopener"
            variant="body2"
            sx={{
              mt: 1,
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            {customer.email}
          </Link>

          <Box sx={{ color: 'text.secondary' }}>
            {typeof customer.relation_code === 'object' && customer.relation_code !== null 
              ? customer.relation_code.code || JSON.stringify(customer.relation_code) 
              : customer.relation_code}
          </Box>
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
          <Box>
            Klantpercentage:
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
              {customer.customer_percentage}
            </Box>
          </Box>
          {customer.is_vat_document_printed ? <Box>
            BTW %0
          </Box> : null}



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
        <Box sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
          Totaalgewicht: {currentOrder?.cart?.cart_total_weight?.toFixed(2)} kg
        </Box>
        <Box sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
          Total Volume: {currentOrder?.cart?.cart_total_volume?.toFixed(2)} m3
        </Box>
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
            shipmentMethods.find(method => method.value === selectedShipmentMethod)?.label || 
            (typeof currentOrder?.delivery_details?.carrier === 'object' && currentOrder?.delivery_details?.carrier !== null 
              ? currentOrder.delivery_details.carrier.code || currentOrder.delivery_details.carrier.name || JSON.stringify(currentOrder.delivery_details.carrier)
              : currentOrder?.delivery_details?.carrier)
          )}
        </Stack>

        {isDeliveryEdit && selectedShipmentMethod === 'dhl' ? (
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoCalculateParcel}
                    onChange={(e) => setAutoCalculateParcel(e.target.checked)}
                  />
                }
                label="Auto parcel berekenen"
              />
            </Stack>

            {!autoCalculateParcel && (
              <>
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
              </>
            )}
          </Stack>
        ) : null}

        <Stack direction="row" alignItems="center">
          <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
            Volgen No.
          </Box>

          {isDeliveryEdit ? (
            <TextField
              size="small"
              value={editableTrackingNumber || updatedDeliveryDetails?.tracking_number || ''}
              onChange={(e) => setEditableTrackingNumber(e.target.value)}
              placeholder="Tracking nummer"
              sx={{ width: 200 }}
            />
          ) : updatedDeliveryDetails?.shipment_id && (selectedShipmentMethod === 'dhl' || currentOrder?.delivery_details?.carrier === 'dhl') ? (
            <Link
              href={`https://my.dhlecommerce.nl/business/shipments/sent/${updatedDeliveryDetails?.shipment_id}`}
              target="_blank"
              rel="noopener"
              sx={{ ml: 0.5 }}
            >
              {typeof updatedDeliveryDetails?.tracking_number === 'object' && updatedDeliveryDetails?.tracking_number !== null ? (updatedDeliveryDetails.tracking_number as any).code || JSON.stringify(updatedDeliveryDetails.tracking_number) : updatedDeliveryDetails?.tracking_number}
            </Link>
          ) : (typeof updatedDeliveryDetails?.tracking_number === 'object' && updatedDeliveryDetails?.tracking_number !== null ? (updatedDeliveryDetails.tracking_number as any).code || JSON.stringify(updatedDeliveryDetails.tracking_number) : updatedDeliveryDetails?.tracking_number)}
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
            <RadioGroup
              value={shippingAddressSource}
              onChange={(e) => {
                const val = e.target.value;
                setShippingAddressSource(val);
                if (val === 'other') {
                  setUpdatedShippingAddress({
                    first_name: '', last_name: '', business_name: '', street_name: '', house_number: '', house_suffix: '', zip_code: '', city: '', country: 'NL', phone_number: ''
                  });
                  setSelectedCountry('NL');
                } else if (val === 'order') {
                  setUpdatedShippingAddress(shippingAddress);
                  setSelectedCountry(shippingAddress?.country || 'NL');
                }
              }}
            >
              <FormControlLabel value="order" control={<Radio />} label={`Huidig adres: ${formatAddress(shippingAddress)}`} />
              {((customer as any)?.addresses || []).map((addr: any) => (
                <FormControlLabel key={addr.id} value={addr.id} control={<Radio />} label={formatAddress(addr)} />
              ))}
              <FormControlLabel value="other" control={<Radio />} label="Anders" />
            </RadioGroup>

            {shippingAddressSource === 'other' && (
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Voornaam:
              </Box>
              <TextField
                value={updatedShippingAddress.first_name}
                onChange={(e) => setUpdatedShippingAddress({ ...updatedShippingAddress, first_name: e.target.value })}
                sx={{ width: 150 }}
              />

            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Achternaam:
              </Box>

              <TextField
                value={updatedShippingAddress.last_name}
                onChange={(e) => setUpdatedShippingAddress({ ...updatedShippingAddress, last_name: e.target.value })}
                sx={{ width: 150 }}
              />

            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Bedrijfsnaam:
              </Box>

              <TextField
                value={updatedShippingAddress.business_name}
                onChange={(e) => setUpdatedShippingAddress({ ...updatedShippingAddress, business_name: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Land:
              </Box>
              <TextField
                select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setUpdatedShippingAddress({
                    ...updatedShippingAddress,
                    country: e.target.value,
                  });
                  setOptions([]);
                }}
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
                handleAddressFetch({ searchText: newValue, country: selectedCountry });
              }} // Fetch on input change
              onChange={(e, selectedOption) => {
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
            </Stack>
            )}
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
                Naam:
              </Box>
              {typeof shippingAddress.first_name === 'object' && shippingAddress.first_name !== null ? JSON.stringify(shippingAddress.first_name) : (shippingAddress.first_name || '')}
              {' '}
              {typeof shippingAddress.last_name === 'object' && shippingAddress.last_name !== null ? JSON.stringify(shippingAddress.last_name) : (shippingAddress.last_name || '')}
            </Stack>
            <Stack direction="row">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Bedrijfsnaam:
              </Box>
              {typeof shippingAddress.business_name === 'object' && shippingAddress.business_name !== null ? JSON.stringify(shippingAddress.business_name) : (shippingAddress.business_name || '')}
            </Stack>
            <Stack direction="row">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Adres
              </Box>
              {typeof shippingAddress.street_name === 'object' && shippingAddress.street_name !== null ? JSON.stringify(shippingAddress.street_name) : (shippingAddress.street_name || '')} {typeof shippingAddress.house_number === 'object' && shippingAddress.house_number !== null ? JSON.stringify(shippingAddress.house_number) : (shippingAddress.house_number || '')}{' '}
              {typeof shippingAddress.house_suffix === 'object' && shippingAddress.house_suffix !== null ? JSON.stringify(shippingAddress.house_suffix) : (shippingAddress.house_suffix || '')}
              <br />
              {`${typeof shippingAddress.zip_code === 'object' && shippingAddress.zip_code !== null ? JSON.stringify(shippingAddress.zip_code) : (shippingAddress.zip_code || '')} ${typeof shippingAddress.city === 'object' && shippingAddress.city !== null ? JSON.stringify(shippingAddress.city) : (shippingAddress.city || '')}`}
              <br />
              {typeof shippingAddress.country === 'object' && shippingAddress.country !== null ? (shippingAddress.country as any).code || JSON.stringify(shippingAddress.country) : (shippingAddress.country || '')}
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

  const renderInvoice = invoiceAddress ? (
    <>
      <CardHeader
        title="Factuuradres"
        action={
          <IconButton onClick={handleInvoiceAddressEditClick}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {isInvoiceAddressEdit ? (
          <Stack spacing={1.5}>
            <RadioGroup
              value={invoiceAddressSource}
              onChange={(e) => {
                const val = e.target.value;
                setInvoiceAddressSource(val);
                if (val === 'other') {
                  setUpdatedInvoiceAddress({
                    first_name: '', last_name: '', business_name: '', street_name: '', house_number: '', house_suffix: '', zip_code: '', city: '', country: 'NL', phone_number: ''
                  });
                } else if (val === 'order') {
                  setUpdatedInvoiceAddress(invoiceAddress || {});
                }
              }}
            >
              <FormControlLabel value="order" control={<Radio />} label={`Huidig adres: ${formatAddress(invoiceAddress)}`} />
              {((customer as any)?.addresses || []).map((addr: any) => (
                <FormControlLabel key={addr.id} value={addr.id} control={<Radio />} label={formatAddress(addr)} />
              ))}
              <FormControlLabel value="other" control={<Radio />} label="Anders" />
            </RadioGroup>

            {invoiceAddressSource === 'other' && (
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Voornaam:
              </Box>
              <TextField
                value={updatedInvoiceAddress.first_name || ''}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, first_name: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Achternaam:
              </Box>
              <TextField
                value={updatedInvoiceAddress.last_name || ''}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, last_name: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Bedrijfsnaam:
              </Box>
              <TextField
                value={updatedInvoiceAddress.business_name || ''}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, business_name: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Straat:
              </Box>
              <TextField
                value={updatedInvoiceAddress.street_name || ''}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, street_name: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Huisnummer:
              </Box>
              <TextField
                value={updatedInvoiceAddress.house_number || ''}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, house_number: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Toevoeging:
              </Box>
              <TextField
                value={updatedInvoiceAddress.house_suffix || ''}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, house_suffix: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Postcode:
              </Box>
              <TextField
                value={updatedInvoiceAddress.zip_code || ''}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, zip_code: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Plaats:
              </Box>
              <TextField
                value={updatedInvoiceAddress.city || ''}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, city: e.target.value })}
                sx={{ width: 150 }}
              />
            </Stack>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Land:
              </Box>
              <TextField
                select
                value={updatedInvoiceAddress.country || 'NL'}
                onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, country: e.target.value })}
                sx={{ width: "auto" }}
              >
                {countryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Telefoonnummer"
              value={updatedInvoiceAddress.phone_number || ''}
              onChange={(e) => setUpdatedInvoiceAddress({ ...updatedInvoiceAddress, phone_number: e.target.value })}
              fullWidth
            />
            </Stack>
            )}
            <Stack direction="row" spacing={1}>
              <Button onClick={handleInvoiceAddressUpdate} variant="contained">
                Opslaan
              </Button>
              <Button variant="outlined" onClick={() => setIsInvoiceAddressEdit(false)}>
                Annuleren
              </Button>
            </Stack>
          </Stack>
        ) : (
          <>
            <Stack direction="row">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Naam:
              </Box>
              {typeof invoiceAddress.first_name === 'object' && invoiceAddress.first_name !== null ? JSON.stringify(invoiceAddress.first_name) : (invoiceAddress.first_name || '')} {typeof invoiceAddress.last_name === 'object' && invoiceAddress.last_name !== null ? JSON.stringify(invoiceAddress.last_name) : (invoiceAddress.last_name || '')}
            </Stack>
            <Stack direction="row">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Bedrijfsnaam:
              </Box>
              {typeof invoiceAddress.business_name === 'object' && invoiceAddress.business_name !== null ? JSON.stringify(invoiceAddress.business_name) : (invoiceAddress.business_name || '')}
            </Stack>
            <Stack direction="row">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Adres
              </Box>
              {typeof invoiceAddress.street_name === 'object' && invoiceAddress.street_name !== null ? JSON.stringify(invoiceAddress.street_name) : (invoiceAddress.street_name || '')} {typeof invoiceAddress.house_number === 'object' && invoiceAddress.house_number !== null ? JSON.stringify(invoiceAddress.house_number) : (invoiceAddress.house_number || '')}{' '}
              {typeof invoiceAddress.house_suffix === 'object' && invoiceAddress.house_suffix !== null ? JSON.stringify(invoiceAddress.house_suffix) : (invoiceAddress.house_suffix || '')}
              <br />
              {`${typeof invoiceAddress.zip_code === 'object' && invoiceAddress.zip_code !== null ? JSON.stringify(invoiceAddress.zip_code) : (invoiceAddress.zip_code || '')} ${typeof invoiceAddress.city === 'object' && invoiceAddress.city !== null ? JSON.stringify(invoiceAddress.city) : (invoiceAddress.city || '')}`}
              <br />
              {typeof invoiceAddress.country === 'object' && invoiceAddress.country !== null ? (invoiceAddress.country as any).code || JSON.stringify(invoiceAddress.country) : (invoiceAddress.country || '')}
            </Stack>
            <Stack direction="row">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Telefoonnummer
              </Box>
              {invoiceAddress.phone_number}
            </Stack>
          </>
        )}
      </Stack>
    </>
  ) : null;

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
          href={`https://my.mollie.com/dashboard/${'org_1065131'}/payments/${typeof payment === 'object' && payment !== null ? payment.code || payment.id || '' : payment}`}
          variant="body2"
          target="_blank"
          rel="noopener"
          sx={{ cursor: 'pointer' }}
        >
          {typeof payment === 'object' && payment !== null ? payment.code || payment.id || JSON.stringify(payment) : payment}
        </Link>
        {/* <Iconify icon="logos:mastercard" width={24} sx={{ ml: 0.5 }} /> */}
      </Stack>
    </>
  );

  const renderInvoiceDate = (
    <>
      <CardHeader
        title="Factuurdatum"
        action={
          <IconButton onClick={handleInvoiceDateEditClick}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />
      <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
        {isInvoiceDateEdit ? (
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center">
              <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
                Factuurdatum:
              </Box>
              <DatePicker
                value={invoiceDate}
                onChange={(newValue) => setInvoiceDate(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: 200 }
                  }
                }}
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button onClick={handleInvoiceDateUpdate} variant="contained">
                Opslaan
              </Button>
              <Button variant="outlined" onClick={() => setIsInvoiceDateEdit(false)}>
                Annuleren
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center">
            <Box component="span" sx={{ color: 'text.secondary', width: 120, flexShrink: 0 }}>
              Factuurdatum:
            </Box>
            {currentOrder?.invoice_date ? new Date(currentOrder.invoice_date).toLocaleDateString('nl-NL') : 'Niet ingesteld'}
          </Stack>
        )}
      </Stack>
    </>
  );

  return (
    <Card>

      {renderInvoiceDate}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderCustomer}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderShipping}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderInvoice}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderDelivery}

      <Divider sx={{ borderStyle: 'dashed' }} />

      {renderPayment}

    </Card>
  );
}
