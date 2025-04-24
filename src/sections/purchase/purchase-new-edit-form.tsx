import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSelect,
  RHFTextField,
  RHFAutocomplete
} from 'src/components/hook-form';

import { IPurchaseItem } from 'src/types/purchase';
import { ISupplierItem } from 'src/types/supplier';

type Props = {
  currentPurchase?: IPurchaseItem;
};

export default function PurchaseNewEditForm({ currentPurchase }: Props) {
  const { t } = useTranslate();

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewPurchaseSchema = Yup.object().shape({
    supplier_name: Yup.string().required(t('required')),
    products: Yup.array().min(1, t('at_least_one_product')),
    total_amount: Yup.number().min(0, t('must_be_positive')).required(t('required')),
  });

  const defaultValues = useMemo(
    () => ({
      supplier_name: currentPurchase?.supplier_name || '',
      supplier: currentPurchase?.supplier || null,
      products: currentPurchase?.products || [],
      total_amount: currentPurchase?.total_amount || 0,
      status: currentPurchase?.status || 'pending',
      notes: currentPurchase?.notes || '',
    }),
    [currentPurchase]
  );

  const methods = useForm({
    resolver: yupResolver(NewPurchaseSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isDirty) localStorage.setItem('purchaseFormData', JSON.stringify(values));
  }, [isDirty, values]);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('purchaseFormData') || '{}');
    if (savedData && Object.keys(savedData).length > 0) {
      methods.reset(savedData);
    }
  }, [methods]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentPurchase) {
        await axiosInstance.put(`/purchases/${currentPurchase.id}/`, data);
      } else {
        await axiosInstance.post('/purchases/', data);
      }

      localStorage.removeItem('purchaseFormData');
      enqueueSnackbar(currentPurchase ? t('update_success') : t('create_success'));
      router.push(paths.dashboard.purchase.list);
    } catch (error) {
      console.error(error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat() as string[];
        errorMessages.forEach((errorMessage) => {
          enqueueSnackbar(errorMessage, { variant: 'error' });
        });
      } else {
        enqueueSnackbar(error.message || t('something_went_wrong'), { variant: 'error' });
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
              <RHFTextField name="supplier_name" label={t('supplier_name')} />

              <RHFAutocomplete
                name="supplier"
                label={t('supplier')}
                options={[]} // TODO: Add supplier options from API
                getOptionLabel={(option: string | ISupplierItem) =>
                  typeof option === 'string' ? option : option.name
                }
              />

              <RHFTextField
                name="total_amount"
                label={t('total_amount')}
                type="number"
              />

              <RHFSelect name="status" label={t('status')}>
                <option value="pending">{t('pending')}</option>
                <option value="completed">{t('completed')}</option>
                <option value="cancelled">{t('cancelled')}</option>
              </RHFSelect>

              <RHFTextField
                name="notes"
                label={t('notes')}
                multiline
                rows={4}
                sx={{ gridColumn: '1/-1' }}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentPurchase ? t('create_purchase') : t('save_changes')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
