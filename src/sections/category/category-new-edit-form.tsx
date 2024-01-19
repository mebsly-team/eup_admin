import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useGetCategories } from 'src/api/category';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

type Category = {
  name: string;
  parent_category: number;
};

type Props = {
  currentCategory?: Category;
};

export default function CategoryNewEditForm({ currentCategory }: Props) {
  const router = useRouter();
  const { items } = useGetCategories();
  console.log('items', items);
  const { enqueueSnackbar } = useSnackbar();

  const NewSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    parent_category: Yup.mixed().notRequired(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentCategory?.name || '',
      parent_category: currentCategory?.parent_category || null,
    }),
    [currentCategory]
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
      const payload: Category = {
        name: data.name,
        parent_category: data?.parent_category?.id,
      };
      if (currentCategory) {
        const response = await axiosInstance.put(`/categories/${currentCategory.id}/`, payload);
      } else {
        const response = await axiosInstance.post(`/categories/`, payload);
      }
      enqueueSnackbar(currentCategory ? 'Update success!' : 'Create success!');
      reset();
      router.push(paths.dashboard.category.root);
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: 'Hatalı İşlem!' });
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
              <RHFTextField name="name" label=" Name" />
              <Stack spacing={1.5}>
                <RHFAutocomplete
                  name="parent_category"
                  label="Top Categories"
                  autoHighlight
                  options={items.map((option) => option)}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id} value={option.id}>
                      {option.name}
                    </li>
                  )}
                />
              </Stack>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentCategory ? 'Create Category' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
