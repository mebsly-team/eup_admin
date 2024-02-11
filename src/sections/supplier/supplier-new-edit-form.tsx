import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { Divider, MenuItem, Typography } from '@mui/material';

import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { useLocales, useTranslate } from 'src/locales';

import { ISupplierItem } from 'src/types/supplier';

type Props = {
  currentSupplier?: ISupplierItem;
};

export default function SupplierNewEditForm({ currentSupplier }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();

  const NewSchema = Yup.object().shape({
    name: Yup.string().required(t('name_required')),
    email_general: Yup.string().required(t('email_required')).email(t('email_must_be_valid')),
    phone: Yup.string().required(t('phone_required')),
    mobile_phone: Yup.string().required(t('phone_required')),
    contact_person: Yup.string().required(t('contact_person_required')),
  });
  const defaultValues = useMemo(
    () => ({
      name: currentSupplier?.name || null,
      email_general: currentSupplier?.email_general || null,
      phone: currentSupplier?.phone || null,
      mobile_phone: currentSupplier?.mobile_phone || null,
      gender: currentSupplier?.gender || null,
      address: currentSupplier?.address || null,
      city: currentSupplier?.city || null,
      country: currentSupplier?.country || null,
      postal_code: currentSupplier?.postal_code || null,
      contact_person: currentSupplier?.contact_person || null,
      iban: currentSupplier?.iban || null,
      bic: currentSupplier?.bic || null,
      debtor_number: currentSupplier?.debtor_number || null,
      payment_terms: currentSupplier?.payment_terms || null,
      payment_instruction: currentSupplier?.payment_instruction || null,
      payment_method: currentSupplier?.payment_method || null,
      minimum_order_amount: currentSupplier?.minimum_order_amount || null,
      account_holder_name: currentSupplier?.account_holder_name || null,
      account_holder_city: currentSupplier?.account_holder_city || null,
      vat_number: currentSupplier?.vat_number || null,
      kvk_number: currentSupplier?.kvk_number || null,
      facebook: currentSupplier?.facebook || null,
      linkedin: currentSupplier?.linkedin || null,
      twitter: currentSupplier?.twitter || null,
      instagram: currentSupplier?.instagram || null,
      pinterest: currentSupplier?.pinterest || null,
      tiktok: currentSupplier?.tiktok || null,
      website: currentSupplier?.website || null,
      memo: currentSupplier?.memo || null,
    }),
    [currentSupplier]
  );

  const methods = useForm({
    resolver: yupResolver(NewSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentSupplier) {
        const response = await axiosInstance.put(`/suppliers/${currentSupplier.id}/`, data);
      } else {
        const response = await axiosInstance.post(`/suppliers/`, data);
      }
      enqueueSnackbar(currentSupplier ? t('update_success') : t('create_success'));
      reset();
      router.push(paths.dashboard.supplier.root);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(errorMessage => {
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
          console.error("An unexpected error occurred:", error);
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
              <RHFTextField name="name" label={t("name")} />
              <RHFTextField name="contact_person" label={t("contact_person")} />
              <RHFTextField name="email_general" label={t("email")} />
              <RHFTextField name="phone" label={t("phone")} />
              <RHFTextField name="mobile_phone" label={t("mobile")} />
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
              <RHFTextField name="iban" label={t("iban")} />
              <RHFTextField name="bic" label={t("bic")} />
              <RHFTextField name="account_holder_name" label={t("account_holder_name")} />
              <RHFTextField name="account_holder_city" label={t("account_holder_city")} />
              <RHFTextField name="vat_number" label={t("vat_number")} />
              <RHFTextField name="kvk_number" label={t("kvk_number")} />
              <RHFTextField name="debtor_number" label={t("debtor_number")} />
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
              <RHFTextField name="payment_terms" label={t("payment_terms")} />
              <RHFTextField name="payment_instruction" label={t("payment_instruction")} />
              <RHFTextField name="payment_method" label={t("payment_method")} />
              <RHFTextField name="order_method" label={t("order_method")} />
              <RHFTextField name="delivery_time_of_order" label={t("delivery_time_of_order")} type="number" />
              <RHFTextField name="minimum_order_amount" label={t("minimum_order_amount")} type="number" />
              <RHFTextField name="percentage_to_add" label={t("percentage_to_add")} type="number" />

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
              <RHFTextField name="facebook" label={t("facebook")} />
              <RHFTextField name="linkedin" label={t("linkedin")} />
              <RHFTextField name="twitter" label={t("twitter")} />
              <RHFTextField name="instagram" label={t("instagram")} />
              <RHFTextField name="pinterest" label={t("pinterest")} />
              <RHFTextField name="tiktok" label={t("tiktok")} />
              <RHFTextField name="website" label={t("website")} />
              <RHFTextField name="memo" label={t("memo")} />
              <RHFTextField name="supplier_extra_info" label={t("supplier_extra_info")} />
              <RHFSwitch
                name="is_active"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("active")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="hasGivenPaymentAuth"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("has_given_payment_auth")}
                  </Typography>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name="has_connection_with_supplier_system"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {t("has_connection_with_supplier_system")}
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
