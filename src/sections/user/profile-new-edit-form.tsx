import * as Yup from 'yup';
import moment from 'moment';
import { useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MenuItem } from '@mui/material';

import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useTranslate } from 'src/locales';



export default function ProfileEditForm() {
    const { t } = useTranslate();
    const { enqueueSnackbar } = useSnackbar();

    // Form validation schema
    const ProfileSchema = Yup.object().shape({
        first_name: Yup.string().required(t('required')),
        last_name: Yup.string().required(t('required')),
        phone_number: Yup.string()
            .required(t('required'))
            .matches(/^[0-9]+$/, t('phone_number_must_be_numeric')),
        mobile_number: Yup.string()
            .required(t('required'))
            .matches(/^[0-9]+$/, t('mobile_number_must_be_numeric')),
        gender: Yup.string().required(t('required')),
        birthdate: Yup.date()
            .required(t('required'))
            .max(moment().subtract(18, 'years').toDate(), t('birthdate_must_be_before_18_years'))
            .nullable()
    });

    const defaultValues = {
        first_name: '',
        last_name: '',
        phone_number: '',
        mobile_number: '',
        gender: '',
        birthdate: null,
    };

    const methods = useForm({
        resolver: yupResolver(ProfileSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        control,
        formState: { isSubmitting, errors },
    } = methods;

    const fetchProfile = async () => {
        try {
            const response = await axiosInstance.get(`/profile/`);
            const data = response.data;
            console.log(data);

            reset({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone_number: data.phone_number || '',
                mobile_number: data.mobile_number || '',
                gender: data.gender || '',
                birthdate: data.birthdate ? moment(data.birthdate).toDate() : null
            });
        } catch (error) {
            console.error(error);
            enqueueSnackbar(t('error_occurred'), { variant: 'error' });
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [reset]);

    const onSubmit = handleSubmit(async (data) => {
        const finalData = { ...data, birthdate: moment(data.birthdate).format('YYYY-MM-DD') };
        try {
            let response;

            response = await axiosInstance.put(`/profile/`, finalData);

            enqueueSnackbar(t('update_success'));
            fetchProfile();
        } catch (error) {
            if (error) {
                console.log('error', error);
                const errorData = error;
                if (errorData) {
                    Object.entries(errorData).forEach(([fieldName, errors]) => {
                        errors.forEach((errorMsg) => {
                            enqueueSnackbar({
                                variant: 'error',
                                message: `${t(fieldName)}: ${errorMsg}`,
                            });
                        });
                    });
                }
            } else {
                console.error('Error:', error.message);
                enqueueSnackbar({ variant: 'error', message: t('error') });
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
                            gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                        >
                            <RHFTextField name="first_name" label={t('name')} />
                            <RHFTextField name="last_name" label={t('lastname')} />
                            <RHFSelect name="gender" label={t('Gender')}>
                                <MenuItem value="male">{t('male')}</MenuItem>
                                <MenuItem value="female">{t('female')}</MenuItem>
                            </RHFSelect>
                            <Controller
                                name="birthdate"
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <DatePicker
                                        label={t('birthdate')}
                                        value={field.value}
                                        onChange={(newValue) => field.onChange(newValue)}
                                        renderInput={(params) => (
                                            <RHFTextField {...params} error={!!error} helperText={error?.message} />
                                        )}
                                    />
                                )}
                            />
                            <RHFTextField name="phone_number" label={t('phone')} />
                            <RHFTextField name="mobile_number" label={t('mobile')} />
                        </Box>
                    </Card>

                    <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                            {t('save')}
                        </LoadingButton>
                    </Stack>
                </Grid>
                {JSON.stringify(errors)}

            </Grid>
        </FormProvider>
    );
}