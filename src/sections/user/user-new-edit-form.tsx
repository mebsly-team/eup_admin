import * as Yup from 'yup';
import moment from 'moment';
import { useMemo, useState, useEffect } from 'react';
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

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

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

  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [addressList, setAddressList] = useState(currentUser?.addresses || []);
  console.log("🚀 ~ UserNewEditForm ~ addressList:", addressList)

  const {
    control: controlAddressForm,
    handleSubmit: handleSubmitAddressForm,
    reset: resetAddressForm,
    setValue: setValueAddressForm,
    register,
    watch: watchAddress,
  } = useForm({
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
    },
  });
  console.log("🚀 ~ UserNewEditForm ~ watchAddress:", watchAddress())

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

        await axiosInstance.put(`/address/${addressList[editingIndex].id}/`, formData);
      } else {
        const response = await axiosInstance.post("/address/", formData);
        setAddressList([...addressList, response.data]);
      }

      setOpenAddressForm(false);
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };


  const handleDeleteAddress = async (index) => {
    try {
      const addressId = addressList[index]?.id;
      if (addressId) {
        await axiosInstance.delete(`/address/${addressId}/`);
      }
      setAddressList(addressList.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };


  const NewUserSchema = Yup.object().shape({
    type: Yup.string().required(t('required')),
    relation_code: Yup.string().required(t('required')),
    first_name: !isBusiness && Yup.string().required(t('required')),
    last_name: !isBusiness && Yup.string().required(t('required')),
    password: currentUser ? null : Yup.string().required(t('required')),
    email: Yup.string().required(t('required')).email(t('email_must_be_valid')),
    phone_number:
      isBusiness &&
      Yup.string()
        .required(t('phone_required'))
        .matches(/^[0-9]+$/, t('phone_number_must_be_numeric')),
    mobile_number:
      isBusiness &&
      Yup.string()
        .required(t('mobile_required'))
        .matches(/^[0-9]+$/, t('mobile_number_must_be_numeric')),
    // gender: Yup.string().required(t('gender_required')),
    birthdate: Yup.date()
      .required(t('birthdate_required'))
      .max(moment().subtract(18, 'years').toDate(), t('birthdate_must_be_before_18_years'))
      .nullable(),
    fax: Yup.string().nullable(),
    facebook: Yup.string().nullable().url(t('facebook_url_invalid')),
    linkedin: Yup.string().nullable().url(t('linkedin_url_invalid')),
    twitter: Yup.string().nullable().url(t('twitter_url_invalid')),
    instagram: Yup.string().nullable().url(t('instagram_url_invalid')),
    pinterest: Yup.string().nullable().url(t('pinterest_url_invalid')),
    tiktok: Yup.string().nullable().url(t('tiktok_url_invalid')),
    notes: Yup.string().nullable(),
    website: Yup.string().nullable().url(t('website_url_invalid')),
    is_active: Yup.boolean().required(),
    business_name: isBusiness && Yup.string().required(t('required')),
    contact_person_name: isBusiness && Yup.string().required(t('required')),
    contact_person_phone:
      isBusiness &&
      Yup.string()
        .required(t('required'))
        .matches(/^[0-9]+$/, t('contact_person_phone_number_must_be_numeric')),
    contact_person_email:
      isBusiness && Yup.string().required(t('required')).email(t('contact_person_email_invalid')),
    // department: isBusiness && Yup.string().required(t('required')),
    classification: isBusiness && Yup.string().required(t('required')),
    branch: isBusiness && Yup.string().required(t('required')),
    iban: isBusiness && Yup.string().required(t('required')),
    bic: isBusiness && Yup.string().required(t('required')),
    account_holder_name: isBusiness && Yup.string().required(t('required')),
    account_holder_city: isBusiness && Yup.string().required(t('required')),
    vat: isBusiness && Yup.string().required(t('required')),
    kvk: isBusiness && Yup.string().required(t('required')),
    payment_method: isBusiness && Yup.string().required(t('required')),
    customer_percentage: isBusiness && Yup.number().required(t('required')),
    invoice_discount: isBusiness && Yup.number().required(t('required')),
    payment_termin: isBusiness && Yup.string().required(t('required')),
    credit_limit: isBusiness && Yup.number().required(t('required')),
    invoice_address: isBusiness && Yup.string().required(t('required')),
    invoice_language: isBusiness && Yup.string().required(t('required')),
    discount_group: isBusiness && Yup.string().required(t('required')),
    inform_via: isBusiness && Yup.string().required(t('required')),
    customer_color: isBusiness && Yup.string().required(t('required')),
    relation_type: isBusiness && Yup.string().required(t('required')),
    relation_via: isBusiness && Yup.string().required(t('required')),
    days_closed: isBusiness && Yup.string().required(t('required')),
    days_no_delivery: isBusiness && Yup.string().required(t('required')),
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

  const CUSTOMER_COLORS = [
    { value: 'red', label: t('red') },
    { value: 'yellow', label: t('yellow') },
    { value: 'green', label: t('green') },
    { value: 'blue', label: t('blue') },
    { value: 'brown', label: t('brown') },
  ];
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
      credit_limit: currentUser?.credit_limit || "",
      customer_percentage: currentUser?.customer_percentage || "",
      days_closed: currentUser?.days_closed || "",
      days_no_delivery: currentUser?.days_no_delivery || "",
      department: currentUser?.department || "",
      account_holder_city: currentUser?.account_holder_city || "",
      account_holder_name: currentUser?.account_holder_name || "",
      bic: currentUser?.bic || "",
      branch: currentUser?.branch || "",
      business_name: currentUser?.business_name || "",
      discount_group: currentUser?.discount_group || "",
      extra_phone: currentUser?.extra_phone || "",
      fullname: currentUser?.fullname || "",
      iban: currentUser?.iban || "",
      inform_via: currentUser?.inform_via || "",
      invoice_address: currentUser?.invoice_address || "",
      invoice_cc_email: currentUser?.invoice_cc_email || "",
      invoice_discount: currentUser?.invoice_discount || "",
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

      // invoice_address: {
      //   address_name: currentUser?.invoice_address?.address_name || '',
      //   first_name: currentUser?.invoice_address?.first_name || '',
      //   last_name: currentUser?.invoice_address?.last_name || '',
      //   salutation: currentUser?.invoice_address?.salutation || '',
      //   phone_number: currentUser?.invoice_address?.phone_number || '',
      //   is_invoice_address: currentUser?.invoice_address?.is_invoice_address ?? false,
      //   street_name: currentUser?.invoice_address?.street_name || '',
      //   house_number: currentUser?.invoice_address?.house_number || '',
      //   house_suffix: currentUser?.invoice_address?.house_suffix || '',
      //   city: currentUser?.invoice_address?.city || '',
      //   state: currentUser?.invoice_address?.state || '',
      //   zip_code: currentUser?.invoice_address?.zip_code || '',
      //   country: currentUser?.invoice_address?.country || '',
      // },

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
  const values = watch();
  console.log("🚀 ~ UserNewEditForm ~ values:", values)
  console.log('🚀 ~ ProductNewEditForm ~ errors:', errors);

  useEffect(() => {
    if (isDirty) localStorage.setItem('formData', JSON.stringify(values));
  }, [isDirty, values]);

  useEffect(() => {
    console.log('useEffect');
    const savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    if (savedData) {
      methods.reset(savedData);
    }
  }, [methods]);

  console.log('errors', errors);
  const onSubmit = handleSubmit(async (data) => {
    console.log("🚀 ~ onSubmit ~ data:", data)
    try {
      data.birthdate = moment.isDate(data.birthdate)
        ? moment(data.birthdate).format('YYYY-MM-DD')
        : null;
      if (currentUser) {
        const response = await axiosInstance.put(`/users/${currentUser.id}/`, data);
      } else {
        const response = await axiosInstance.post('/users/', data);
      }
      localStorage.removeItem('formData');

      enqueueSnackbar(currentUser ? t('update_success') : t('create_success'));
      reset();
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.log('error', error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((errorMessage) => {
          console.error(errorMessage);
          enqueueSnackbar({ variant: 'error', message: errorMessage });
        });
      } else {
        const errorMessages = Object.entries(error);
        if (errorMessages.length) {
          errorMessages.forEach(([fieldName, errors]) => {
            errors?.forEach((errorMsg) => {
              enqueueSnackbar({
                variant: 'error',
                message: `${t(fieldName)}: ${errorMsg}`,
              });
            });
          });
        } else {
          console.error('An unexpected error occurred:', error);
          enqueueSnackbar({ variant: 'error', message: JSON.stringify(error) });
        }
      }
    }
  });

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="relation_code" label={t('relation_code')} />
                <RHFSelect
                  name="type"
                  label={t('user_type')}
                  onChange={(e) => {
                    setValue('type', e.target.value);
                    setIsBusiness(!['particular', 'admin'].includes(e.target.value));
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {USER_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <RHFTextField name="email" label={t('email')} />
                <RHFTextField name="first_name" label={t('name')} />
                <RHFTextField name="last_name" label={t('lastname')} />
                {currentUser ? null : (
                  <RHFTextField name="password" label={t('password')} type="password" />
                )}
                <RHFSelect
                  name="gender"
                  label={t('gender')}
                  onChange={(e) => {
                    setValue('gender', e.target.value);
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <MenuItem key="M" value="M">
                    M
                  </MenuItem>
                  <MenuItem key="M" value="M">
                    V
                  </MenuItem>
                </RHFSelect>
                <RHFTextField name="phone_number" label={t('phone')} />
                <RHFTextField name="mobile_number" label={t('mobile')} />
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
                <RHFSwitch
                  name="inform_when_new_products"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('inform_when_new_products')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_subscribed_newsletters"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_subscribed_newsletters')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_access_granted_social_media"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_access_granted_social_media')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 5 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="business_name" label={t('business_name')} />
                <RHFTextField name="contact_person_name" label={t('contact_person_name')} />
                <RHFTextField name="contact_person_address" label={t('contact_person_address')} />
                <RHFTextField name="contact_person_postcode" label={t('contact_person_postcode')} />
                <RHFTextField name="contact_person_city" label={t('contact_person_city')} />
                <RHFTextField name="contact_person_country" label={t('contact_person_country')} />
                <RHFTextField name="contact_person_phone" label={t('contact_person_phone')} />
                <RHFTextField name="contact_person_email" label={t('contact_person_email')} />
                <RHFTextField
                  name="contact_person_department"
                  label={t('contact_person_department')}
                />
                <RHFTextField name="contact_person_branch" label={t('contact_person_branch')} />
                <RHFTextField name="classification" label={t('classification')} />
                <RHFTextField
                  name="contact_person_nationality"
                  label={t('contact_person_nationality')}
                />
                <RHFTextField name="branch" label={t('branch')} />
                <RHFTextField name="iban" label={t('iban')} />
                <RHFTextField name="bic" label={t('bic')} />
                <RHFTextField name="account_holder_name" label={t('account_holder_name')} />
                <RHFTextField name="account_holder_city" label={t('account_holder_city')} />
                <RHFTextField name="vat" label={t('vat')} />
                <RHFTextField name="kvk" label={t('kvk')} />
                <RHFSelect name="payment_method" label={t('payment_method')}>
                  <MenuItem value="">{t('none')}</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {PAYMENT_METHOD_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFTextField
                  name="customer_percentage"
                  label={t('customer_percentage')}
                  type="number"
                />
                <RHFTextField name="invoice_discount" label={t('invoice_discount')} type="number" />
                <RHFTextField name="payment_termin" label={t('payment_termin')} />
                <RHFTextField name="credit_limit" label={t('credit_limit')} type="number" />
                <RHFTextField name="invoice_address" label={t('invoice_address')} />
                <RHFTextField name="invoice_language" label={t('invoice_language')} />
                <RHFTextField name="discount_group" label={t('discount_group')} />
                <RHFTextField name="inform_via" label={t('inform_via')} />
                <RHFSelect name="customer_color" label={t('customer_color')}>
                  <MenuItem value="">{t('none')}</MenuItem>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {CUSTOMER_COLORS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFTextField name="relation_type" label={t('relation_type')} />
                <RHFTextField name="relation_via" label={t('relation_via')} />
                <RHFTextField name="days_closed" label={t('days_closed')} />
                <RHFTextField name="days_no_delivery" label={t('days_no_delivery')} />
                <RHFTextField name="fax" label={t('fax')} />
                <RHFTextField name="website" label={t('website')} />
                <RHFSwitch
                  name="incasseren"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('incasseren')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_payment_termin_active"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_payment_termin_active')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_eligible_to_work_with"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_eligible_to_work_with')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="is_no_payment"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('is_no_payment')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="inform_when_new_products"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('inform_when_new_products')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />

                <RHFSwitch
                  name="notify"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('notify')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 5 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="facebook" label={t('facebook')} placeholder='https://www.facebook.com/yourprofile' />
                <RHFTextField name="linkedin" label={t('linkedin')} placeholder='https://www.linkedin.com/in/yourprofile' />
                <RHFTextField name="twitter" label={t('twitter')} placeholder='https://www.twitter.com/yourhandle' />
                <RHFTextField name="instagram" label={t('instagram')} placeholder='https://www.instagram.com/yourprofile' />
                <RHFTextField name="pinterest" label={t('pinterest')} placeholder='https://www.pinterest.com/yourprofile' />
                <RHFTextField name="tiktok" label={t('tiktok')} placeholder='https://www.tiktok.com/@yourusername' />
              </Box>
            </Card>
            <Card sx={{ p: 3, mt: 5 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="notes" label={t('notes')} type="textarea" />
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 5 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFSwitch
                  name="is_active"
                  labelPlacement="start"
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {t('active')}
                    </Typography>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
              </Box>
            </Card>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? t('create_user') : t('save')}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
      <div>
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Adres Type</TableCell>
                <TableCell>Adres Naam</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell>Acties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addressList.map((address, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {address?.is_delivery_address ? t('delivery_address') :
                      address?.is_contact_person_address ? t('contact_person_address') : address?.is_invoice_address ? t('invoice_address') : ""}
                  </TableCell>
                  <TableCell>{address.address_name}</TableCell>
                  <TableCell>
                    {`${address.street_name} ${address.house_number} ${address.house_suffix}, ${address.city}, ${address.country}`}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenAddressForm(index)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteAddress(index)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleAddAddress()}
          sx={{ mt: 2 }}
        >
          Adres Toevoegen
        </Button>

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
                {...register("house_number")}
                label="Huisnummer"
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
              />
              <TextField
                {...register("country")}
                label="Land"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="country"
              />
              <Controller
                name="addressType"
                control={controlAddressForm}
                defaultValue="" // Standaard leeg
                render={({ field }) => (
                  <FormControl fullWidth sx={{ my: 1 }}>
                    <InputLabel>Adres Type</InputLabel>
                    <Select {...field} label="Adres Type">
                      <MenuItem value="">Geen</MenuItem>
                      {ADDRESS_TYPES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                )}
              />
              <TextField
                {...register("address_name")}
                label="Adres Naam"
                fullWidth
                sx={{ my: 1 }}
                autoComplete="address-name"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddressForm}>Annuleren</Button>
            <Button onClick={handleSubmitAddressForm(onSubmitAddress)}>Opslaan</Button>
          </DialogActions>
        </Dialog>

      </div>


    </>
  );
}
