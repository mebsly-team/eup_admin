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
import { Divider, MenuItem, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';

import { IUserItem } from 'src/types/user';

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

  const NewUserSchema = Yup.object().shape({
    type: Yup.string().required(t('type_required')),
    first_name: !isBusiness && Yup.string().required(t('name_required')),
    last_name: !isBusiness && Yup.string().required(t('surname_required')),
    password: currentUser ? null : Yup.string().required(t('password_required')),
    email: Yup.string().required(t('email_required')).email(t('email_must_be_valid')),
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
      .max(moment().subtract(18, 'years').toDate(), t('birthdate_must_be_before_18_years')),
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
    is_staff: Yup.boolean().required(),
    business_name: isBusiness && Yup.string().required(t('business_name_required')),
    contact_person_name: isBusiness && Yup.string().required(t('contact_person_name_required')),
    contact_person_phone_number:
      isBusiness &&
      Yup.string()
        .required(t('contact_person_phone_required'))
        .matches(/^[0-9]+$/, t('contact_person_phone_number_must_be_numeric')),
    contact_person_email:
      isBusiness &&
      Yup.string()
        .required(t('contact_person_email_required'))
        .email(t('contact_person_email_invalid')),
    department: isBusiness && Yup.string().required(t('department_required')),
    classification: isBusiness && Yup.string().required(t('classification_required')),
    branch: isBusiness && Yup.string().required(t('branch_required')),
    iban: isBusiness && Yup.string().required(t('iban_required')),
    bic: isBusiness && Yup.string().required(t('bic_required')),
    account_holder_name: isBusiness && Yup.string().required(t('account_holder_name_required')),
    account_holder_city: isBusiness && Yup.string().required(t('account_holder_city_required')),
    vat: isBusiness && Yup.string().required(t('vat_required')),
    kvk: isBusiness && Yup.string().required(t('kvk_required')),
    payment_method: isBusiness && Yup.string().required(t('payment_method_required')),
    customer_percentage: isBusiness && Yup.number().required(t('customer_percentage_required')),
    invoice_discount: isBusiness && Yup.number().required(t('invoice_discount_required')),
    payment_termin: isBusiness && Yup.string().required(t('payment_termin_required')),
    credit_limit: isBusiness && Yup.number().required(t('credit_limit_required')),
    invoice_address: isBusiness && Yup.string().required(t('invoice_address_required')),
    invoice_language: isBusiness && Yup.string().required(t('invoice_language_required')),
    discount_group: isBusiness && Yup.string().required(t('discount_group_required')),
    inform_via: isBusiness && Yup.string().required(t('inform_via_required')),
    customer_color: isBusiness && Yup.string().required(t('customer_color_required')),
    relation_type: isBusiness && Yup.string().required(t('relation_type_required')),
    relation_via: isBusiness && Yup.string().required(t('relation_via_required')),
    days_closed: isBusiness && Yup.string().required(t('days_closed_required')),
    days_no_delivery: isBusiness && Yup.string().required(t('days_no_delivery_required')),
    incasseren: isBusiness && Yup.boolean().required(),
    is_payment_termin_active: isBusiness && Yup.boolean().required(),
    is_eligible_to_work_with: isBusiness && Yup.boolean().required(),
    inform_when_new_products: isBusiness && Yup.boolean().required(),
    notify: isBusiness && Yup.boolean().required(),
  });

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
      // id: currentUser?.id || null,
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
      phone_number: currentUser?.phone_number || '',
      mobile_number: currentUser?.mobile_number || '',
      // gender: currentUser?.gender || '',
      type: currentUser?.type || '',
      birthdate: currentUser?.birthdate || '',
      fax: currentUser?.fax || null,
      facebook: currentUser?.facebook || null,
      linkedin: currentUser?.linkedin || null,
      twitter: currentUser?.twitter || null,
      instagram: currentUser?.instagram || null,
      pinterest: currentUser?.pinterest || null,
      tiktok: currentUser?.tiktok || null,
      notes: currentUser?.notes || null,
      website: currentUser?.website || null,
      is_active: currentUser?.is_active || true,
      is_staff: currentUser?.is_staff || false,
      is_no_payment: currentUser?.is_no_payment || false,
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
  console.log('🚀 ~ ProductNewEditForm ~ errors:', errors);

  useEffect(() => {
    if (isDirty) localStorage.setItem('formData', JSON.stringify(values));
  }, [isDirty, values]);

  useEffect(() => {
    console.log('useEffect');
    const savedData = JSON.parse(localStorage.getItem('formData') || '{}');
    if (savedData) {
      methods.reset(savedData); // Reset form with saved data
    }
  }, [methods]);

  console.log('errors', errors);
  const onSubmit = handleSubmit(async (data) => {
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
              <RHFTextField name="phone_number" label={t('phone')} />
              <RHFTextField name="mobile_number" label={t('mobile')} />
              <Controller
                name="birthdate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label={t('birthdate')}
                    value={field.value || null}
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

          {isBusiness ? (
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
                <RHFTextField
                  name="contact_person_phone_number"
                  label={t('contact_person_phone_number')}
                />
                <RHFTextField name="contact_person_email" label={t('contact_person_email')} />
                <RHFTextField name="department" label={t('department')} />
                <RHFTextField name="classification" label={t('classification')} />
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
          ) : null}

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
                name="is_staff"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t('staff')}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
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
  );
}
