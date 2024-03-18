import * as Yup from 'yup';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import { Divider, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

import { ISupplierItem } from 'src/types/supplier';

type Props = {
  currentSupplier?: ISupplierItem;
};

export default function SupplierNewEditForm({ currentSupplier }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();

  const PAYMENT_METHOD_TYPES = [
    { value: 'bank', label: t('bank') },
    { value: 'kas', label: t('kas') },
    { value: 'pin', label: t('pin') },
  ];

  const ORDER_METHOD_TYPES = [
    { value: 'mail', label: t('mail') },
    { value: 'whatsapp', label: t('whatsapp') },
    { value: 'phone', label: t('phone') },
  ];

  const NewSchema = Yup.object().shape({
    name: Yup.string().required(t('name_required')),
    supplier_code: Yup.string().required(t('supplier_code_required')),
    email: Yup.string().required(t('email_required')).email(t('email_must_be_valid')),
    phone: Yup.string().required(t('phone_required')),
    mobile_phone: Yup.string().required(t('phone_required')),
    // gender: Yup.string().required(t('gender_required')),
    // address: Yup.string().required(t('address_required')),
    // city: Yup.string().required(t('city_required')),
    // country: Yup.string().required(t('country_required')),
    // postal_code: Yup.string().required(t('postal_code_required')),
    contact_person_name: Yup.string().required(t('contact_person_required')),
    iban: Yup.string().required(t('iban_required')),
    bic: Yup.string().required(t('bic_required')),
    debtor_number: Yup.string().required(t('debtor_number_required')),
    payment_terms: Yup.string().required(t('payment_terms_required')),
    payment_instruction: Yup.string().required(t('payment_instruction_required')),
    payment_method: Yup.string().required(t('payment_method_required')),
    minimum_order_amount: Yup.number().required(t('minimum_order_amount_required')),
    account_holder_name: Yup.string().required(t('account_holder_name_required')),
    account_holder_city: Yup.string().required(t('account_holder_city_required')),
    vat_number: Yup.string().required(t('vat_number_required')),
    kvk_number: Yup.string().required(t('kvk_number_required')),
  });
  const defaultValues = useMemo(
    () => ({
      name: currentSupplier?.name || null,
      supplier_code: currentSupplier?.supplier_code || null,
      owner_fullname: currentSupplier?.owner_fullname || null,
      owner_birthday: currentSupplier?.owner_birthday || null,
      email: currentSupplier?.email || null,
      email_extra: currentSupplier?.email_extra || null,
      phone: currentSupplier?.phone || null,
      mobile_phone: currentSupplier?.mobile_phone || null,
      fax: currentSupplier?.fax || null,
      // gender: currentSupplier?.gender || null,
      address: currentSupplier?.address || null,
      postcode: currentSupplier?.postcode || null,
      city: currentSupplier?.city || null,
      country: currentSupplier?.country || null,

      contact_person_name: currentSupplier?.contact_person_name || null,
      contact_person_email: currentSupplier?.contact_person_email || null,
      contact_person_phone: currentSupplier?.contact_person_phone || null,
      contact_person_branch: currentSupplier?.contact_person_branch || null,
      contact_person_department: currentSupplier?.contact_person_department || null,
      contact_person_address: currentSupplier?.contact_person_address || null,
      contact_person_postcode: currentSupplier?.contact_person_postcode || null,
      contact_person_city: currentSupplier?.contact_person_city || null,
      contact_person_country: currentSupplier?.contact_person_country || null,
      contact_person_nationality: currentSupplier?.contact_person_nationality || null,
      classification: currentSupplier?.classification || null,

      bank_account_number: currentSupplier?.bank_account_number || null,
      iban: currentSupplier?.iban || null,
      bic: currentSupplier?.bic || null,
      account_holder_name: currentSupplier?.account_holder_name || null,
      account_holder_city: currentSupplier?.account_holder_city || null,
      vat_number: currentSupplier?.vat_number || null,
      kvk_number: currentSupplier?.kvk_number || null,
      debtor_number: currentSupplier?.debtor_number || null,

      payment_terms: currentSupplier?.payment_terms || null,
      payment_instruction: currentSupplier?.payment_instruction || null,
      payment_method: currentSupplier?.payment_method || null,
      order_method: currentSupplier?.order_method || null,
      delivery_time_of_order: currentSupplier?.delivery_time_of_order || null,
      minimum_order_amount: currentSupplier?.minimum_order_amount || null,
      percentage_to_add: currentSupplier?.percentage_to_add || null,
      invoice_discount: currentSupplier?.invoice_discount || null,
      closed_days: currentSupplier?.closed_days || [],

      facebook: currentSupplier?.facebook || null,
      linkedin: currentSupplier?.linkedin || null,
      twitter: currentSupplier?.twitter || null,
      instagram: currentSupplier?.instagram || null,
      pinterest: currentSupplier?.pinterest || null,
      tiktok: currentSupplier?.tiktok || null,
      website: currentSupplier?.website || null,
      memo: currentSupplier?.memo || null,
      supplier_extra_info: currentSupplier?.supplier_extra_info || null,
      is_active: currentSupplier?.is_active || null,
      hasGivenPaymentAuth: currentSupplier?.hasGivenPaymentAuth,
      has_connection_with_supplier_system: currentSupplier?.has_connection_with_supplier_system,
    }),
    [currentSupplier]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting, isDirty, errors },
    ...rest
  } = methods;
  const values = watch();
  console.log('🚀 ~ ProductNewEditForm ~ errors:', errors);

  useEffect(() => {
    if (isDirty) localStorage.setItem('formData', JSON.stringify(values));
  }, [isDirty, values]);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    if (savedData) {
      methods.reset(savedData); // Reset form with saved data
    }
  }, [methods]);
  const onSubmit = handleSubmit(async (data) => {
    try {
      const ex_date = data.owner_birthday
        ? format(new Date(data.owner_birthday), 'yyyy-MM-dd')
        : null;
      data.owner_birthday = ex_date;
      if (currentSupplier) {
        const response = await axiosInstance.put(`/suppliers/${currentSupplier.id}/`, data);
      } else {
        const response = await axiosInstance.post(`/suppliers/`, data);
      }
      localStorage.removeItem('formData');

      enqueueSnackbar(currentSupplier ? t('update_success') : t('create_success'));
      reset();
      router.push(paths.dashboard.supplier.root);
    } catch (error) {
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
            errors.forEach((errorMsg) => {
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
              <RHFTextField name="name" label={t('business_name')} />
              <RHFTextField name="supplier_code" label={t('supplier_code')} />
              <RHFTextField name="owner_fullname" label={t('owner_fullname')} />
              <DatePicker
                label={t('owner_birthday')}
                value={
                  getValues('owner_birthday') ? new Date(getValues('owner_birthday')) : new Date()
                }
                format="dd/MM/yyyy"
                onChange={(newValue) => setValue('owner_birthday', newValue)}
              />
              <RHFTextField name="email" label={t('email')} />
              <RHFTextField name="email_extra" label={t('email_extra')} />
              <RHFTextField name="phone" label={t('phone')} />
              <RHFTextField name="mobile_phone" label={t('mobile')} />
              <RHFTextField name="fax" label={t('fax')} />
              <RHFTextField name="address" label={t('address')} />
              <RHFTextField name="postcode" label={t('postcode')} />
              <RHFTextField name="city" label={t('city')} />
              <RHFTextField name="country" label={t('country')} />
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
              <RHFTextField name="contact_person_name" label={t('contact_person_name')} />
              <RHFTextField name="contact_person_email" label={t('contact_person_email')} />
              <RHFTextField name="contact_person_phone" label={t('contact_person_phone')} />
              <RHFTextField name="contact_person_address" label={t('contact_person_address')} />
              <RHFTextField name="contact_person_postcode" label={t('contact_person_postcode')} />
              <RHFTextField name="contact_person_city" label={t('contact_person_city')} />
              <RHFTextField name="contact_person_country" label={t('contact_person_country')} />
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
              <RHFTextField name="bank_account_number" label={t('bank_account_number')} />
              <RHFTextField name="iban" label={t('iban')} />
              <RHFTextField name="bic" label={t('bic')} />
              <RHFTextField name="account_holder_name" label={t('account_holder_name')} />
              <RHFTextField name="account_holder_city" label={t('account_holder_city')} />
              <RHFTextField name="vat_number" label={t('vat_number')} />
              <RHFTextField name="kvk_number" label={t('kvk_number')} />
              <RHFTextField name="debtor_number" label={t('debtor_number')} />
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
              <RHFTextField name="payment_terms" label={t('payment_terms')} />
              <RHFTextField name="payment_instruction" label={t('payment_instruction')} />
              <RHFSelect name="payment_method" label={t('payment_method')}>
                <MenuItem value="">---</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {PAYMENT_METHOD_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect name="order_method" label={t('order_method')}>
                <MenuItem value="">---</MenuItem>
                <Divider sx={{ borderStyle: 'dashed' }} />
                {ORDER_METHOD_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTextField
                name="delivery_time_of_order"
                label={t('delivery_time_of_order')}
                type="number"
              />
              <RHFTextField
                name="minimum_order_amount"
                label={t('minimum_order_amount')}
                type="number"
              />
              <RHFTextField name="percentage_to_add" label={t('percentage_to_add')} type="number" />
              <RHFTextField name="invoice_discount" label={t('invoice_discount')} type="number" />
              <RHFTextField name="closed_days" label={t('closed_days')} />
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
              <RHFTextField name="facebook" label={t('facebook')} />
              <RHFTextField name="linkedin" label={t('linkedin')} />
              <RHFTextField name="twitter" label={t('twitter')} />
              <RHFTextField name="instagram" label={t('instagram')} />
              <RHFTextField name="pinterest" label={t('pinterest')} />
              <RHFTextField name="tiktok" label={t('tiktok')} />
              <RHFTextField name="website" label={t('website')} />
              <RHFTextField name="memo" label={t('memo')} />
              <RHFTextField name="supplier_extra_info" label={t('supplier_extra_info')} />
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
              <RHFSwitch
                name="hasGivenPaymentAuth"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t('has_given_payment_auth')}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="has_connection_with_supplier_system"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t('has_connection_with_supplier_system')}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Box>
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentSupplier ? t('create_supplier') : t('save_changes')}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
