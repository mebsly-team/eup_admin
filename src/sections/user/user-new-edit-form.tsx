import * as Yup from 'yup';
import moment from 'moment';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import UserDetailsHistory from './user-details-history';
import { IUserItem } from 'src/types/user';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Map } from '@mui/icons-material';
import { MAP_USER_COLORS } from 'src/constants/colors';
import { useAuthContext } from 'src/auth/hooks';

// The dashboard header is fixed: one bar on small screens, two from lg up.
// Only from md up: the card is not sticky below that and `top` would shift it.
const STICKY_TOP = { md: 64, lg: 128 };
// Below the form's own sticky header.
const SIDE_STICKY_TOP = { xs: 164, lg: 228 };
const SECTION_SX = { scrollMarginTop: { xs: 80, md: 164, lg: 228 } };

const FIELD_GRID_SX = {
  rowGap: 3,
  columnGap: 2,
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
};

const SECTIONS = [
  { id: 'user-account', title: 'Account', hint: 'Waarmee de klant inlogt en hoe hij is ingedeeld' },
  { id: 'user-person', title: 'Persoon', hint: 'Gegevens van de accounthouder' },
  { id: 'user-business', title: 'Bedrijf', hint: 'Bedrijfsgegevens en contactpersoon' },
  {
    id: 'user-payment',
    title: 'Betaling en korting',
    hint: 'Voorwaarden die op elke bestelling van deze klant gelden',
  },
  { id: 'user-invoicing', title: 'Facturatie', hint: 'Waar en hoe facturen naartoe gaan' },
  { id: 'user-relation', title: 'Relatie', hint: 'Interne indeling en afspraken' },
  { id: 'user-communication', title: 'Communicatie', hint: 'Wat de klant van ons ontvangt' },
  { id: 'user-social', title: 'Social media', hint: 'Profielen van de klant' },
  { id: 'user-notes', title: 'Notities', hint: 'Interne notitie over deze klant' },
];

const SITE_SOURCE_OPTIONS = [
  { value: 'kooptop.com', label: 'kooptop.com' },
  { value: 'europowerbv.com', label: 'europowerbv.com' },
];

type Props = {
  currentUser?: IUserItem;
};

export default function UserNewEditForm({ currentUser }: Props) {
  const { t, onChangeLang } = useTranslate();
  const router = useRouter();
  const [isBusiness, setIsBusiness] = useState(
    !['particular', 'admin'].includes(currentUser?.type || 'particular')
  );
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [addressList, setAddressList] = useState(currentUser?.addresses || []);
  console.log("🚀 ~ UserNewEditForm ~ addressList:", addressList)

  const [isOtherSelected, setIsOtherSelected] = useState(false);

  type UserType = 'special' | 'wholesaler' | 'supermarket' | 'particular';

  const AddressSchema = Yup.object().shape({
    addressType: Yup.string().required(t('required')),
    address_name: Yup.string().required(t('required')),
    zip_code: Yup.string().required(t('required')),
    first_name: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    last_name: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    salutation: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    phone_number: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    street_name: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    house_number: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    house_suffix: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    city: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    state: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    country: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
    customer_color: Yup.string().nullable().transform((value) => (value === '' ? null : value)),
  });

  const {
    control: controlAddressForm,
    handleSubmit: handleSubmitAddressForm,
    reset: resetAddressForm,
    setValue: setValueAddressForm,
    register,
    watch: watchAddress,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: yupResolver(AddressSchema),
    mode: 'onChange',
    defaultValues: {
      address_name: '',
      first_name: '',
      last_name: '',
      salutation: '',
      phone_number: '',
      street_name: '',
      house_number: '',
      house_suffix: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      addressType: '',
      customer_color: '',
    },
  });

  const NewUserSchema = Yup.object().shape({
    type: Yup.string().required(t('required')),
    relation_code: Yup.string().required(t('required')),
    first_name: !isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    last_name: !isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // password: currentUser ? Yup.string() : Yup.string().required(t('required')),
    // email: Yup.string().required(t('required')).email(t('email_must_be_valid')),
    // phone_number: isBusiness ? Yup.string()
    //   .required(t('phone_required'))
    //   .matches(/^[0-9]+$/, t('phone_number_must_be_numeric')) : Yup.string(),
    // mobile_number: isBusiness ? Yup.string()
    //   .required(t('mobile_required'))
    //   .matches(/^[0-9]+$/, t('mobile_number_must_be_numeric')) : Yup.string(),
    // birthdate: Yup.date()
    //   .required(t('birthdate_required'))
    //   .max(moment().subtract(18, 'years').toDate(), t('birthdate_must_be_before_18_years'))
    //   .nullable(),
    // fax: Yup.string().nullable(),
    // facebook: Yup.string().nullable().url(t('facebook_url_invalid')),
    // linkedin: Yup.string().nullable().url(t('linkedin_url_invalid')),
    // twitter: Yup.string().nullable().url(t('twitter_url_invalid')),
    // instagram: Yup.string().nullable().url(t('instagram_url_invalid')),
    // pinterest: Yup.string().nullable().url(t('pinterest_url_invalid')),
    // tiktok: Yup.string().nullable().url(t('tiktok_url_invalid')),
    // notes: Yup.string().nullable(),
    // website: Yup.string().nullable().url(t('website_url_invalid')),
    // is_active: Yup.boolean().required(),
    // business_name: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // contact_person_name: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // contact_person_phone: isBusiness ? Yup.string()
    //   .required(t('required'))
    //   .matches(/^[0-9]+$/, t('contact_person_phone_number_must_be_numeric')) : Yup.string(),
    // contact_person_email: isBusiness ? Yup.string().required(t('required')).email(t('contact_person_email_invalid')) : Yup.string(),
    // classification: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // branch: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // iban: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // bic: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // account_holder_name: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // account_holder_city: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // vat: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // kvk: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // payment_method: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // customer_percentage: isBusiness ? Yup.number().required(t('required')) : Yup.number(),
    // invoice_discount: isBusiness ? Yup.number().required(t('required')) : Yup.number(),
    // payment_termin: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // credit_limit: isBusiness ? Yup.number().required(t('required')) : Yup.number(),
    // invoice_address: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // invoice_language: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // discount_group: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // inform_via: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // customer_color: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // relation_type: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // relation_via: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // days_closed: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // days_no_delivery: isBusiness ? Yup.string().required(t('required')) : Yup.string(),
    // credit_limit: Yup.number().nullable().transform((value) => (value === '' ? null : value)),
    // invoice_discount: Yup.number().nullable().transform((value) => (value === '' ? null : value)),
  });

  const ADDRESS_TYPES = [
    { value: 'delivery', label: t('delivery_address') },
    { value: 'contact_person', label: t('contact_person_address') },
    { value: 'invoice', label: t('invoice_address') },
  ];
  const USER_TYPES = [
    { value: 'special', label: t('special') },
    { value: 'wholesaler', label: t('wholesaler') },
    { value: 'supermarket', label: t('supermarket') },
    { value: 'particular', label: t('particular') },
  ];

  const mappedColors = MAP_USER_COLORS.map(color => ({
    value: color.value,
    label: t(color.value),
    color: color.color
  }));
  const PAYMENT_METHOD_TYPES = [
    { value: 'bank', label: t('bank') },
    { value: 'kas', label: t('kas') },
    { value: 'pin', label: t('pin') },
  ];

  const defaultValues = useMemo(
    () => ({
      addressList: currentUser?.addresses || [],
      relation_code: currentUser?.relation_code || '',
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
      gender: currentUser?.gender || '',
      site_source: currentUser?.site_source || '',
      phone_number: currentUser?.phone_number || '',
      mobile_number: currentUser?.mobile_number || '',
      mobile_phone: currentUser?.mobile_phone || '',
      contact_person_name: currentUser?.contact_person_name || '',
      contact_person_address: currentUser?.contact_person_address || '',
      contact_person_postcode: currentUser?.contact_person_postcode || '',
      contact_person_city: currentUser?.contact_person_city || '',
      contact_person_country: currentUser?.contact_person_country || '',
      contact_person_phone: currentUser?.contact_person_phone || '',
      contact_person_email: currentUser?.contact_person_email || '',
      contact_person_department: currentUser?.contact_person_department || '',
      contact_person_branch: currentUser?.contact_person_branch || '',
      contact_person_nationality: currentUser?.contact_person_nationality || '',
      type: currentUser?.type || 'particular',
      birthdate: currentUser?.birthdate || null,
      password: currentUser?.password || "New@#$Default@#$Pass@#$123",
      fax: currentUser?.fax || null,
      facebook: currentUser?.facebook || null,
      linkedin: currentUser?.linkedin || null,
      twitter: currentUser?.twitter || null,
      instagram: currentUser?.instagram || null,
      pinterest: currentUser?.pinterest || null,
      tiktok: currentUser?.tiktok || null,
      notes: currentUser?.notes || null,
      website: currentUser?.website || null,
      classification: currentUser?.classification || "",
      credit_limit: currentUser?.credit_limit || 0,
      customer_percentage: currentUser?.customer_percentage || 10,
      days_closed: currentUser?.days_closed || "",
      days_no_delivery: currentUser?.days_no_delivery || "",
      department: currentUser?.department || "",
      account_holder_city: currentUser?.account_holder_city || "",
      account_holder_name: currentUser?.account_holder_name || "",
      bic: currentUser?.bic || "",
      branch: currentUser?.branch || "",
      business_name: currentUser?.business_name || "",
      // discount_group: currentUser?.discount_group || "",
      extra_phone: currentUser?.extra_phone || "",
      fullname: currentUser?.fullname || "",
      iban: currentUser?.iban || "",
      inform_via: currentUser?.inform_via || "",
      invoice_address: currentUser?.invoice_address || "",
      invoice_cc_email: currentUser?.invoice_cc_email || "",
      invoice_discount: currentUser?.invoice_discount || 0,
      invoice_email: currentUser?.invoice_email || "",
      invoice_language: currentUser?.invoice_language || "",
      kvk: currentUser?.kvk || "",
      payment_termin: currentUser?.payment_termin || "",
      payment_method: currentUser?.payment_method || "",
      phone: currentUser?.phone || "",
      relation_type: currentUser?.relation_type || "",
      relation_via: currentUser?.relation_via || "",
      vat: currentUser?.vat || "",
      is_active: currentUser?.is_active ?? false,
      is_staff: currentUser?.is_staff ?? false,
      is_no_payment: currentUser?.is_no_payment ?? false,
      inform_when_new_products: currentUser?.inform_when_new_products ?? false,
      is_eligible_to_work_with: currentUser?.is_eligible_to_work_with ?? false,
      is_relation_user: currentUser?.is_relation_user ?? false,
      is_relation_user2: currentUser?.is_relation_user ?? false,
      is_vat_document_printed: currentUser?.is_vat_document_printed ?? false,
      is_payment_termin_active: currentUser?.is_payment_termin_active ?? false,
      needs_electronic_invoice: currentUser?.needs_electronic_invoice ?? false,
      incasseren: currentUser?.incasseren ?? false,
      notify: currentUser?.notify ?? false,
      is_subscribed_newsletters: currentUser?.is_subscribed_newsletters ?? false,
      is_access_granted_social_media: currentUser?.is_access_granted_social_media ?? false,
      customer_color: currentUser?.customer_color ?? "",
      history: currentUser?.history || [],
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting, isDirty, errors },
    ...rest
  } = methods;

  // Reset form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      reset(defaultValues);
      const isStandard = ['Bakkerij', 'Slagerij', 'Kantor', ''].includes(currentUser.branch || '');
      setIsOtherSelected(!isStandard);
    } else {
      reset({});
      setIsOtherSelected(false);
    }
  }, [currentUser, reset, defaultValues]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as UserType;
    const typeToPercentage: Record<UserType, number> = {
      special: 15,
      wholesaler: 10,
      supermarket: 5,
      particular: 0,
    };

    setValue('type', newType);
    setValue('customer_percentage', typeToPercentage[newType]);
    setIsBusiness(!['particular', 'admin'].includes(newType));
  };

  const handleAddAddress = () => {
    resetAddressForm({
      address_name: '',
      first_name: '',
      last_name: '',
      salutation: '',
      phone_number: '',
      street_name: '',
      house_number: '',
      house_suffix: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      addressType: '',
    });
    setEditingIndex(null);  // Yeni ekleme olduğu için edit modunu sıfırla
    setOpenAddressForm(true);
  };
  const handleOpenAddressForm = (index = null) => {
    setEditingIndex(index);

    if (index !== null) {
      const existingAddress = addressList[index];
      resetAddressForm(existingAddress);

      const addressType = existingAddress.is_delivery_address
        ? "delivery"
        : existingAddress.is_contact_person_address
          ? "contact_person"
          : existingAddress.is_invoice_address
            ? "invoice"
            : "";

      setValueAddressForm("addressType", addressType); // Varsayılan değer atama
    } else {
      resetAddressForm();
      setValueAddressForm("addressType", ""); // Yeni eklerken boş bırak
    }

    setOpenAddressForm(true);
  };


  const handleCloseAddressForm = () => {
    setOpenAddressForm(false);
    resetAddressForm(); // Clear form
  };

  const onSubmitAddress = async (data) => {
    console.log("🚀 ~ onSubmitAddress ~ data:", data);
    console.log("🚀 ~ onSubmitAddress ~ addressErrors:", addressErrors);

    try {
      const formData = {
        user_id: currentUser.id,
        ...data,
        first_name: currentUser.first_name || "-",
        last_name: currentUser.last_name || "-",
        is_business_main_address: data.addressType === "business",
        is_delivery_address: data.addressType === "delivery",
        is_contact_person_address: data.addressType === "contact_person",
        is_invoice_address: data.addressType === "invoice",
      };

      if (editingIndex !== null) {
        const updatedList = [...addressList];
        updatedList[editingIndex] = formData;
        setAddressList(updatedList);

        await axiosInstance.put(`/address/${addressList[editingIndex].id}/?all=true`, formData);
      } else {
        const response = await axiosInstance.post("/address/", formData);
        setAddressList([...addressList, response.data]);
      }

      setOpenAddressForm(false);
      enqueueSnackbar('Address saved successfully!', { variant: 'success' });
    } catch (error) {
      console.error("Error saving address:", error);
      enqueueSnackbar('Error saving address', { variant: 'error' });
    }
  };


  const handleDeleteAddress = async (index) => {
    try {
      const addressId = addressList[index]?.id;
      if (addressId) {
        await axiosInstance.delete(`/address/${addressId}/?all=true`);
      }
      setAddressList(addressList.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleShowOnMap = (address: any) => {
    if (address.latitude && address.longitude) {
      const mapUrl = `${window.location.origin}${paths.dashboard.map.list}?lat=${address.latitude}&lng=${address.longitude}`;
      window.open(mapUrl, '_blank');
    }
  };

  console.log("🚀 ~ UserNewEditForm ~ values:", watch());
  console.log('🚀 ~ ProductNewEditForm ~ errors:', errors);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Convert all email fields to lowercase
      if (data.email) data.email = data.email.toLowerCase();
      if (data.contact_person_email) data.contact_person_email = data.contact_person_email.toLowerCase();
      if (data.invoice_email) data.invoice_email = data.invoice_email.toLowerCase();
      if (data.invoice_cc_email) data.invoice_cc_email = data.invoice_cc_email.toLowerCase();

      data.birthdate = moment.isDate(data.birthdate)
        ? moment(data.birthdate).format('YYYY-MM-DD')
        : null;

      // Track changes for history
      const changes = [];
      if (currentUser?.id) {
        // Compare fields and record changes
        if (data.first_name !== currentUser.first_name) {
          changes.push(`Voornaam gewijzigd van "${currentUser.first_name}" naar "${data.first_name}" door ${user?.email}`);
        }
        if (data.last_name !== currentUser.last_name) {
          changes.push(`Achternaam gewijzigd van "${currentUser.last_name}" naar "${data.last_name}" door ${user?.email}`);
        }
        if (data.email !== currentUser.email) {
          changes.push(`Email gewijzigd van "${currentUser.email}" naar "${data.email}" door ${user?.email}`);
        }
        if (data.phone_number !== currentUser.phone_number) {
          changes.push(`Telefoonnummer gewijzigd van "${currentUser.phone_number}" naar "${data.phone_number}" door ${user?.email}`);
        }
        if (data.mobile_number !== currentUser.mobile_number) {
          changes.push(`Mobiel nummer gewijzigd van "${currentUser.mobile_number}" naar "${data.mobile_number}" door ${user?.email}`);
        }
        if (data.type !== currentUser.type) {
          changes.push(`Type gewijzigd van "${currentUser.type}" naar "${data.type}" door ${user?.email}`);
        }
        if (data.business_name !== currentUser.business_name) {
          changes.push(`Bedrijfsnaam gewijzigd van "${currentUser.business_name}" naar "${data.business_name}" door ${user?.email}`);
        }
        if (data.vat !== currentUser.vat) {
          changes.push(`BTW nummer gewijzigd van "${currentUser.vat}" naar "${data.vat}" door ${user?.email}`);
        }
        if (data.kvk !== currentUser.kvk) {
          changes.push(`KvK nummer gewijzigd van "${currentUser.kvk}" naar "${data.kvk}" door ${user?.email}`);
        }
        if (data.customer_percentage !== currentUser.customer_percentage) {
          changes.push(`Klantpercentage gewijzigd van ${currentUser.customer_percentage} naar ${data.customer_percentage} door ${user?.email}`);
        }
        if (data.credit_limit !== currentUser.credit_limit) {
          changes.push(`Kredietlimiet gewijzigd van ${currentUser.credit_limit} naar ${data.credit_limit} door ${user?.email}`);
        }
        if (data.customer_color !== currentUser.customer_color) {
          changes.push(`Klantkleur gewijzigd van "${currentUser.customer_color}" naar "${data.customer_color}" door ${user?.email}`);
        }
        if (data.is_active !== currentUser.is_active) {
          changes.push(`Status gewijzigd van "${currentUser.is_active ? 'Actief' : 'Inactief'}" naar "${data.is_active ? 'Actief' : 'Inactief'}" door ${user?.email}`);
        }

        // Additional field changes
        if (data.birthdate !== currentUser.birthdate) {
          changes.push(`Geboortedatum gewijzigd van "${currentUser.birthdate}" naar "${data.birthdate}" door ${user?.email}`);
        }
        if (data.gender !== currentUser.gender) {
          changes.push(`Geslacht gewijzigd van "${currentUser.gender}" naar "${data.gender}" door ${user?.email}`);
        }
        if (data.site_source !== currentUser.site_source) {
          changes.push(`Site bron gewijzigd van "${currentUser.site_source}" naar "${data.site_source}" door ${user?.email}`);
        }
        if (data.relation_code !== currentUser.relation_code) {
          changes.push(`Relatiecode gewijzigd van "${currentUser.relation_code}" naar "${data.relation_code}" door ${user?.email}`);
        }
        if (data.contact_person_name !== currentUser.contact_person_name) {
          changes.push(`Contactpersoon naam gewijzigd van "${currentUser.contact_person_name}" naar "${data.contact_person_name}" door ${user?.email}`);
        }
        if (data.contact_person_email !== currentUser.contact_person_email) {
          changes.push(`Contactpersoon email gewijzigd van "${currentUser.contact_person_email}" naar "${data.contact_person_email}" door ${user?.email}`);
        }
        if (data.contact_person_phone !== currentUser.contact_person_phone) {
          changes.push(`Contactpersoon telefoon gewijzigd van "${currentUser.contact_person_phone}" naar "${data.contact_person_phone}" door ${user?.email}`);
        }
        if (data.iban !== currentUser.iban) {
          changes.push(`IBAN gewijzigd van "${currentUser.iban}" naar "${data.iban}" door ${user?.email}`);
        }
        if (data.bic !== currentUser.bic) {
          changes.push(`BIC gewijzigd van "${currentUser.bic}" naar "${data.bic}" door ${user?.email}`);
        }
        if (data.payment_method !== currentUser.payment_method) {
          changes.push(`Betaalmethode gewijzigd van "${currentUser.payment_method}" naar "${data.payment_method}" door ${user?.email}`);
        }
        if (data.payment_termin !== currentUser.payment_termin) {
          changes.push(`Betalingstermijn gewijzigd van "${currentUser.payment_termin}" naar "${data.payment_termin}" door ${user?.email}`);
        }
        if (data.invoice_discount !== currentUser.invoice_discount) {
          changes.push(`Factuurkorting gewijzigd van ${currentUser.invoice_discount} naar ${data.invoice_discount} door ${user?.email}`);
        }
        if (data.invoice_language !== currentUser.invoice_language) {
          changes.push(`Factuurtaal gewijzigd van "${currentUser.invoice_language}" naar "${data.invoice_language}" door ${user?.email}`);
        }
        // if (data.discount_group !== currentUser.discount_group) {
        //   changes.push(`Kortingsgroep gewijzigd van "${currentUser.discount_group}" naar "${data.discount_group}" door ${user?.email}`);
        // }
        if (data.inform_via !== currentUser.inform_via) {
          changes.push(`Informeren via gewijzigd van "${currentUser.inform_via}" naar "${data.inform_via}" door ${user?.email}`);
        }
        if (data.days_closed !== currentUser.days_closed) {
          changes.push(`Gesloten dagen gewijzigd van "${currentUser.days_closed}" naar "${data.days_closed}" door ${user?.email}`);
        }
        if (data.days_no_delivery !== currentUser.days_no_delivery) {
          changes.push(`Geen levering dagen gewijzigd van "${currentUser.days_no_delivery}" naar "${data.days_no_delivery}" door ${user?.email}`);
        }
        if (data.invoice_email !== currentUser.invoice_email) {
          changes.push(`Factuur e-mail gewijzigd van "${currentUser.invoice_email}" naar "${data.invoice_email}" door ${user?.email}`);
        }
        if (data.invoice_cc_email !== currentUser.invoice_cc_email) {
          changes.push(`Factuur CC e-mail gewijzigd van "${currentUser.invoice_cc_email}" naar "${data.invoice_cc_email}" door ${user?.email}`);
        }

        // Social media changes
        if (data.facebook !== currentUser.facebook) {
          changes.push(`Facebook gewijzigd van "${currentUser.facebook}" naar "${data.facebook}" door ${user?.email}`);
        }
        if (data.linkedin !== currentUser.linkedin) {
          changes.push(`LinkedIn gewijzigd van "${currentUser.linkedin}" naar "${data.linkedin}" door ${user?.email}`);
        }
        if (data.twitter !== currentUser.twitter) {
          changes.push(`Twitter gewijzigd van "${currentUser.twitter}" naar "${data.twitter}" door ${user?.email}`);
        }
        if (data.instagram !== currentUser.instagram) {
          changes.push(`Instagram gewijzigd van "${currentUser.instagram}" naar "${data.instagram}" door ${user?.email}`);
        }
        if (data.pinterest !== currentUser.pinterest) {
          changes.push(`Pinterest gewijzigd van "${currentUser.pinterest}" naar "${data.pinterest}" door ${user?.email}`);
        }
        if (data.tiktok !== currentUser.tiktok) {
          changes.push(`TikTok gewijzigd van "${currentUser.tiktok}" naar "${data.tiktok}" door ${user?.email}`);
        }
        if (data.website !== currentUser.website) {
          changes.push(`Website gewijzigd van "${currentUser.website}" naar "${data.website}" door ${user?.email}`);
        }

        // Boolean field changes
        if (data.is_staff !== currentUser.is_staff) {
          changes.push(`Medewerker status gewijzigd van "${currentUser.is_staff ? 'Ja' : 'Nee'}" naar "${data.is_staff ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.is_no_payment !== currentUser.is_no_payment) {
          changes.push(`Geen betaling status gewijzigd van "${currentUser.is_no_payment ? 'Ja' : 'Nee'}" naar "${data.is_no_payment ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.inform_when_new_products !== currentUser.inform_when_new_products) {
          changes.push(`Informeren bij nieuwe producten gewijzigd van "${currentUser.inform_when_new_products ? 'Ja' : 'Nee'}" naar "${data.inform_when_new_products ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.is_eligible_to_work_with !== currentUser.is_eligible_to_work_with) {
          changes.push(`Geschikt om mee te werken gewijzigd van "${currentUser.is_eligible_to_work_with ? 'Ja' : 'Nee'}" naar "${data.is_eligible_to_work_with ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.is_payment_termin_active !== currentUser.is_payment_termin_active) {
          changes.push(`Betalingstermijn actief gewijzigd van "${currentUser.is_payment_termin_active ? 'Ja' : 'Nee'}" naar "${data.is_payment_termin_active ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.needs_electronic_invoice !== currentUser.needs_electronic_invoice) {
          changes.push(`Elektronische factuur nodig gewijzigd van "${currentUser.needs_electronic_invoice ? 'Ja' : 'Nee'}" naar "${data.needs_electronic_invoice ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.incasseren !== currentUser.incasseren) {
          changes.push(`Incasseren gewijzigd van "${currentUser.incasseren ? 'Ja' : 'Nee'}" naar "${data.incasseren ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.notify !== currentUser.notify) {
          changes.push(`Notificaties gewijzigd van "${currentUser.notify ? 'Ja' : 'Nee'}" naar "${data.notify ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.is_subscribed_newsletters !== currentUser.is_subscribed_newsletters) {
          changes.push(`Nieuwsbrief abonnement gewijzigd van "${currentUser.is_subscribed_newsletters ? 'Ja' : 'Nee'}" naar "${data.is_subscribed_newsletters ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
        if (data.is_access_granted_social_media !== currentUser.is_access_granted_social_media) {
          changes.push(`Sociale media toegang gewijzigd van "${currentUser.is_access_granted_social_media ? 'Ja' : 'Nee'}" naar "${data.is_access_granted_social_media ? 'Ja' : 'Nee'}" door ${user?.email}`);
        }
      } else {
        changes.push(`Gebruiker aangemaakt door ${user?.email}`);
      }

      // Add history entry if there are changes
      if (changes.length > 0) {
        const newHistory = [...(currentUser?.history || [])];
        newHistory.push({
          date: new Date(),
          event: changes.join(', '),
        });
        data.history = newHistory;
      }

      data.unique_identifier = `${data.email}__${data.site_source}`;
      if (currentUser) {
        await axiosInstance.put(`/users/${currentUser.id}/`, data);
      } else {
        await axiosInstance.post('/users/', data);
      }

      enqueueSnackbar(currentUser ? t('update_success') : t('create_success'));
      if (!currentUser) {
        reset();
      }
      router.push(`${paths.dashboard.user.list}?page=1`);
    } catch (error) {
      console.log('error', error);
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).flat();
          errorMessages.forEach((errorMessage) => {
            console.error(errorMessage);
            enqueueSnackbar(String(errorMessage), { variant: 'error' });
          });
        } else if (typeof error.response.data === 'object') {
          Object.entries(error.response.data).forEach(([fieldName, errorMsg]) => {
            enqueueSnackbar(`${errorMsg}`, { variant: 'error' });
          });
        } else {
          enqueueSnackbar(error.response.data, { variant: 'error' });
        }
      } else {
        enqueueSnackbar(JSON.stringify(error), { variant: 'error' });
      }
    } finally {
      reset({}, { keepValues: true });
    }
  });

  const handlePasswordReset = async () => {
    try {
      await axiosInstance.post('/password/reset/', {
        email: currentUser?.email,
        site_source: currentUser?.site_source
      });
      enqueueSnackbar(t('password_reset_email_sent'), { variant: 'success' });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      enqueueSnackbar(t('error_sending_password_reset'), { variant: 'error' });
    }
  };

  const values = watch();

  const headerTitle = currentUser
    ? currentUser.business_name ||
      `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() ||
      currentUser.email
    : t('new_user');

  const renderSwitch = (name: string, label: string, color?: string) => (
    <RHFSwitch
      name={name}
      labelPlacement="start"
      label={
        <Typography variant="body2" sx={{ ...(color && { color }) }}>
          {label}
        </Typography>
      }
      sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
    />
  );

  const renderSection = (
    section: { id: string; title: string; hint: string },
    fields: React.ReactNode,
    switches?: React.ReactNode
  ) => (
    <Card id={section.id} sx={{ p: 3, ...SECTION_SX }}>
      <Typography variant="h6">{section.title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: fields ? 3 : 1 }}>
        {section.hint}
      </Typography>

      {fields && <Box sx={FIELD_GRID_SX}>{fields}</Box>}

      {switches && (
        <>
          {fields && <Divider sx={{ borderStyle: 'dashed', my: 2.5 }} />}
          <Box sx={{ ...FIELD_GRID_SX, rowGap: 0.5 }}>{switches}</Box>
        </>
      )}
    </Card>
  );

  const renderHeader = (
    <Card sx={{ position: { md: 'sticky' }, top: STICKY_TOP, zIndex: 10, mb: 3 }}>
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        spacing={1.5}
        sx={{ px: 2, py: 1.5 }}
      >
        <IconButton
          type="button"
          onClick={() => router.back()}
          aria-label="Terug"
          sx={{ border: (theme) => `solid 1px ${theme.palette.divider}`, borderRadius: 1 }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="h5" noWrap title={headerTitle}>
              {headerTitle}
            </Typography>
            {values.site_source && (
              <Tooltip title={values.site_source}>
                <img
                  style={{ height: 16, width: 16, flexShrink: 0 }}
                  src={`/assets/icons/home/${values.site_source === 'europowerbv.com' ? 'europowerbv.png' : 'kooptop.png'}`}
                  alt={values.site_source}
                />
              </Tooltip>
            )}
            <Label variant="soft" color={values.is_active ? 'success' : 'default'}>
              {values.is_active ? 'Actief' : 'Inactief'}
            </Label>
          </Stack>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {[
              values.relation_code && `Relatiecode ${values.relation_code}`,
              values.type && t(values.type),
              values.email,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </Box>

        {currentUser && (
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:lock-password-outline" />}
            onClick={handlePasswordReset}
          >
            {t('send_password_reset')}
          </Button>
        )}
        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {!currentUser ? t('create_user') : t('save')}
        </LoadingButton>
      </Stack>
    </Card>
  );

  const renderNav = (
    <Box
      component="nav"
      aria-label="Secties"
      sx={{
        display: { xs: 'none', lg: 'block' },
        flex: '0 0 180px',
        position: 'sticky',
        top: SIDE_STICKY_TOP,
      }}
    >
      <Stack spacing={0.25}>
        {SECTIONS.map((section) => (
          <Button
            key={section.id}
            type="button"
            color="inherit"
            onClick={() =>
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            sx={{ justifyContent: 'flex-start', fontWeight: 400 }}
          >
            {section.title}
          </Button>
        ))}
      </Stack>
    </Box>
  );

  const renderAddresses = (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Adressen</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {addressList.length}
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {addressList.map((address: any, index: number) => {
          const addressType =
            (address?.is_delivery_address && t('delivery_address')) ||
            (address?.is_contact_person_address && t('contact_person_address')) ||
            (address?.is_invoice_address && t('invoice_address')) ||
            '';

          return (
            <Box
              key={index}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                typography: 'body2',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                {addressType && (
                  <Label
                    variant="soft"
                    color={
                      (address?.is_delivery_address && 'info') ||
                      (address?.is_invoice_address && 'secondary') ||
                      'default'
                    }
                  >
                    {addressType}
                  </Label>
                )}
                <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                  {address.address_name}
                </Typography>
              </Stack>

              <Box>
                {[address.street_name, address.house_number, address.house_suffix]
                  .filter(Boolean)
                  .join(' ')}
              </Box>
              <Box>
                {[[address.zip_code, address.city].filter(Boolean).join(' '), address.country]
                  .filter(Boolean)
                  .join(', ')}
              </Box>

              <Stack direction="row" sx={{ mt: 0.5, ml: -1 }}>
                <Tooltip title="Bewerken">
                  <IconButton type="button" onClick={() => handleOpenAddressForm(index)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                {address.latitude && address.longitude && (
                  <Tooltip title="Op kaart tonen">
                    <IconButton type="button" onClick={() => handleShowOnMap(address)}>
                      <Map fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Verwijderen">
                  <IconButton type="button" color="error" onClick={() => handleDeleteAddress(index)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          );
        })}

        {addressList.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentUser?.id ? 'Nog geen adressen' : 'Adressen kunnen na het opslaan worden toegevoegd'}
          </Typography>
        )}

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Add />}
          onClick={() => handleAddAddress()}
          disabled={!currentUser?.id}
          type="button"
        >
          Adres Toevoegen
        </Button>
      </Stack>

            <Dialog open={openAddressForm} onClose={handleCloseAddressForm}>
              <DialogTitle>{editingIndex !== null ? 'Bewerk Adres' : 'Adres Toevoegen'}</DialogTitle>
              <DialogContent>
                <form onSubmit={handleSubmitAddressForm(onSubmitAddress)}>

                  <TextField
                    {...register("street_name")}
                    label="Straatnaam"
                    fullWidth
                    sx={{ my: 1 }}
                    autoComplete="street-address"
                  />
                  <TextField
                    {...register("house_number", { valueAsNumber: true })}
                    label="Huisnummer"
                    type="number"
                    fullWidth
                    sx={{ my: 1 }}
                    autoComplete="house-number"
                  />
                  <TextField
                    {...register("house_suffix")}
                    label="Huis Aachtervoegsel"
                    fullWidth
                    sx={{ my: 1 }}
                    autoComplete="address-line2"
                  />
                  <TextField
                    {...register("city")}
                    label="Stad"
                    fullWidth
                    sx={{ my: 1 }}
                    autoComplete="address-level2"
                  />
                  <TextField
                    {...register("state")}
                    label="Provincie"
                    fullWidth
                    sx={{ my: 1 }}
                    autoComplete="address-level1"
                  />
                  <TextField
                    {...register("zip_code")}
                    label="Postcode"
                    fullWidth
                    sx={{ my: 1 }}
                    autoComplete="postal-code"
                    error={!!addressErrors.zip_code}
                    helperText={addressErrors.zip_code?.message}
                  />
                  <TextField
                    {...register("country")}
                    label="Land"
                    fullWidth
                    sx={{ my: 1 }}
                    autoComplete="country"
                  />
                  <FormControl fullWidth sx={{ my: 1 }} error={!!addressErrors.addressType}>
                    <InputLabel>Adres Type</InputLabel>
                    <Controller
                      name="addressType"
                      control={controlAddressForm}
                      defaultValue=""
                      render={({ field }) => (
                        <Select {...field} label="Adres Type">
                          <MenuItem value="">Geen</MenuItem>
                          {ADDRESS_TYPES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {addressErrors.addressType && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                        {addressErrors.addressType.message}
                      </Typography>
                    )}
                  </FormControl>
                  <TextField
                    {...register("address_name")}
                    label="Adres Naam"
                    fullWidth
                    sx={{ my: 1 }}
                    autoComplete="address-name"
                    error={!!addressErrors.address_name}
                    helperText={addressErrors.address_name?.message}
                  />

                  <DialogActions sx={{ mt: 2, px: 0 }}>
                    <Button onClick={handleCloseAddressForm}>Annuleren</Button>
                    <Button type="submit" variant="contained">Opslaan</Button>
                  </DialogActions>
                </form>
              </DialogContent>
            </Dialog>
    </Card>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHeader}

      <Box
        sx={{
          gap: 3,
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {renderNav}

        <Stack spacing={3} sx={{ flex: '1 1 0', minWidth: 0, width: { xs: 1, md: 'auto' } }}>
          {renderSection(
            SECTIONS[0],
            <>
                <RHFTextField name="relation_code" label={t('relation_code')} />
                <RHFSelect
                  name="type"
                  label={t('user_type')}
                  onChange={handleTypeChange}
                >
                  <MenuItem value="">None</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {USER_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFSelect
                  name="site_source"
                  label={t('site_source')}
                  onChange={(e) => {
                    setValue('site_source', e.target.value);
                  }}
                >
                  {SITE_SOURCE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFTextField
                  name="email"
                  label={t('email')}
                  labelColor="purple"
                  onChange={(e) => {
                    setValue('email', e.target.value.toLowerCase());
                  }}
                />
            </>,
            renderSwitch('is_active', t('active'))
          )}

          {renderSection(
            SECTIONS[1],
            <>
                <RHFTextField name="first_name" label={t('name')} labelColor="purple" />
                <RHFTextField name="last_name" label={t('lastname')} labelColor="purple" />
                <RHFSelect
                  name="gender"
                  label={t('gender')}
                  labelColor="purple"
                  onChange={(e) => {
                    setValue('gender', e.target.value);
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <MenuItem key="M" value="M">
                    M
                  </MenuItem>
                  <MenuItem key="V" value="V">
                    V
                  </MenuItem>
                  <MenuItem key="O" value="O">
                    Ander
                  </MenuItem>
                </RHFSelect>
                <Controller
                  name="birthdate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label={t('birthdate')}
                      value={new Date(field.value) || null}
                      format="yyyy-MM-dd"
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
                <RHFTextField name="phone_number" label={t('phone')} labelColor="purple" />
                <RHFTextField name="mobile_number" label={t('mobile')} labelColor="purple" />
            </>
          )}

          {renderSection(
            SECTIONS[2],
            <>
                <RHFTextField name="business_name" label={t('business_name')} labelColor="purple" />
                <Controller
                  name="branch"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const selectValue = isOtherSelected ? 'other' : (field.value || '');

                    return (
                      <Stack spacing={2} sx={{ width: 1 }}>
                        <FormControl fullWidth error={!!error}>
                          <InputLabel id="branch-select-label" sx={{ color: 'purple !important' }}>{t('branch')}</InputLabel>
                          <Select
                            labelId="branch-select-label"
                            label={t('branch')}
                            value={selectValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'other') {
                                setIsOtherSelected(true);
                                field.onChange('');
                              } else {
                                setIsOtherSelected(false);
                                field.onChange(val);
                              }
                            }}
                          >
                            <MenuItem value="">{t('none')}</MenuItem>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <MenuItem value="Bakkerij">Bakkerij</MenuItem>
                            <MenuItem value="Slagerij">Slagerij</MenuItem>
                            <MenuItem value="Kantor">Kantor</MenuItem>
                            <MenuItem value="other">{t('other') || 'Anders...'}</MenuItem>
                          </Select>
                        </FormControl>

                        {isOtherSelected && (
                          <TextField
                            fullWidth
                            label={`${t('branch')} (${t('other') || 'Anders'})`}
                            InputLabelProps={{ sx: { color: 'purple !important' } }}
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      </Stack>
                    );
                  }}
                />
                <RHFTextField name="kvk" label={t('kvk')} labelColor="orange" />
                <RHFTextField name="vat" label={t('vat')} labelColor="orange" />
                <RHFTextField name="contact_person_phone" label={t('contact_person_phone')} labelColor="purple" />
                <RHFTextField
                  name="contact_person_email"
                  label={t('contact_person_email')}
                  labelColor="purple"
                  onChange={(e) => {
                    setValue('contact_person_email', e.target.value.toLowerCase());
                  }}
                />
                <RHFTextField
                  name="contact_person_department"
                  label={t('contact_person_department')}
                />
                <RHFTextField name="contact_person_branch" label={t('contact_person_branch')} />
                <RHFTextField
                  name="contact_person_nationality"
                  label={t('contact_person_nationality')}
                />
                <RHFTextField name="fax" label={t('fax')} />
                <RHFTextField name="website" label={t('website')} />
            </>,
            <>
                <RHFSwitch
                  name="is_vat_document_printed"
                  labelPlacement="start"
                  disabled={!getValues('vat')}
                  label={<>
                    <Typography variant="body1">
                      {t('is_vat_zero')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {t('is_vat_document_printed')}
                    </Typography>
                  </>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
            </>
          )}

          {renderSection(
            SECTIONS[3],
            <>
                <RHFSelect name="payment_method" label={t('payment_method')}>
                  <MenuItem value="">{t('none')}</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {PAYMENT_METHOD_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFSelect name="payment_termin" label={t('payment_termin')} labelColor="orange">
                  <MenuItem value="">{t('none')}</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <MenuItem value="1 week">1 week</MenuItem>
                  <MenuItem value="2 weeks">2 weeks</MenuItem>
                  <MenuItem value="3 weeks">3 weeks</MenuItem>
                  <MenuItem value="4 weeks">4 weeks</MenuItem>
                  <MenuItem value="6 weeks">6 weeks</MenuItem>
                  <MenuItem value="8 weeks">8 weeks</MenuItem>
                </RHFSelect>
                <RHFTextField name="credit_limit" label={t('credit_limit')} type="number" />
                <RHFTextField
                  name="customer_percentage"
                  label={t('customer_percentage')}
                  labelColor="orange"
                  type="number"
                />
                <RHFTextField name="invoice_discount" label={t('invoice_discount')} type="number" />
                <RHFTextField name="iban" label={t('iban')} />
                <RHFTextField name="bic" label={t('bic')} />
                <RHFTextField name="account_holder_name" label={t('account_holder_name')} />
                <RHFTextField name="account_holder_city" label={t('account_holder_city')} />
            </>,
            <>
              {renderSwitch('incasseren', t('incasseren'))}
              {renderSwitch('is_no_payment', t('is_no_payment'))}
            </>
          )}

          {renderSection(
            SECTIONS[4],
            <>
                <RHFTextField name="invoice_email" label={t('invoice_email')} />
                <RHFTextField name="invoice_cc_email" label={t('invoice_cc_email')} />
                <RHFTextField name="invoice_address" label={t('invoice_address')} />
                <RHFTextField name="invoice_language" label={t('invoice_language')} />
            </>
          )}

          {renderSection(
            SECTIONS[5],
            <>
                <RHFTextField name="classification" label={t('classification')} labelColor="orange" />
                <RHFSelect
                  name="customer_color"
                  label={t('customer_color')}
                  labelColor="orange"
                  SelectProps={{
                    renderValue: (value) => {
                      if (!value) return '';
                      const option = MAP_USER_COLORS.find((c) => c.color === value);
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            className="color-dot"
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: value,
                              border: '2px solid #fff',
                              boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                              flexShrink: 0
                            }}
                          />
                          <Typography noWrap>{option ? t(option.value) : value}</Typography>
                        </Box>
                      );
                    }
                  }}
                >
                  <MenuItem value="">{t('none')}</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {MAP_USER_COLORS.map((option) => (
                    <MenuItem
                      key={option.color}
                      value={option.color}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        py: 1,
                        '&:hover .color-dot': {
                          transform: 'scale(1.2)',
                          boxShadow: '0 0 0 2px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      <Box
                        className="color-dot"
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: option.color,
                          border: '2px solid #fff',
                          boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s ease-in-out',
                          flexShrink: 0
                        }}
                      />
                      <Typography noWrap>{t(option.value)}</Typography>
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFTextField name="relation_type" label={t('relation_type')} labelColor="orange" />
                <RHFTextField name="relation_via" label={t('relation_via')} />
                <RHFTextField name="inform_via" label={t('inform_via')} />
                <RHFTextField name="days_closed" label={t('days_closed')} />
                <RHFTextField name="days_no_delivery" label={t('days_no_delivery')} />
            </>,
            renderSwitch('is_eligible_to_work_with', t('is_eligible_to_work_with'))
          )}

          {renderSection(
            SECTIONS[6],
            null,
            <>
              {renderSwitch('inform_when_new_products', t('inform_when_new_products'), 'purple')}
              {renderSwitch('is_subscribed_newsletters', t('is_subscribed_newsletters'), 'purple')}
              {renderSwitch(
                'is_access_granted_social_media',
                t('is_access_granted_social_media'),
                'purple'
              )}
              {renderSwitch('notify', t('notify'))}
            </>
          )}

          {renderSection(
            SECTIONS[7],
            <>
                <RHFTextField name="facebook" label={t('facebook')} placeholder='https://www.facebook.com/yourprofile' />
                <RHFTextField name="linkedin" label={t('linkedin')} placeholder='https://www.linkedin.com/in/yourprofile' />
                <RHFTextField name="twitter" label={t('twitter')} placeholder='https://www.twitter.com/yourhandle' />
                <RHFTextField name="instagram" label={t('instagram')} placeholder='https://www.instagram.com/yourprofile' />
                <RHFTextField name="pinterest" label={t('pinterest')} placeholder='https://www.pinterest.com/yourprofile' />
                <RHFTextField name="tiktok" label={t('tiktok')} placeholder='https://www.tiktok.com/@yourusername' />
            </>
          )}

          <Card id={SECTIONS[8].id} sx={{ p: 3, ...SECTION_SX }}>
            <Typography variant="h6">{SECTIONS[8].title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {SECTIONS[8].hint}
            </Typography>
            <RHFTextField name="notes" label={t('notes')} multiline minRows={3} />
          </Card>
        </Stack>

        <Stack spacing={3} sx={{ flexShrink: 0, width: { xs: 1, md: 320 } }}>
          {renderAddresses}

          {currentUser && <UserDetailsHistory currentUser={currentUser} />}
        </Stack>
      </Box>
    </FormProvider>
  );
}
