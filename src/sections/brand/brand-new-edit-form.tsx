import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { IBrandItem } from 'src/types/brand';

// The dashboard header is fixed: one bar on small screens, two from lg up.
// Only from md up: the card is not sticky below that and `top` would shift it.
const STICKY_TOP = { md: 64, lg: 128 };

type Props = {
  currentBrand?: IBrandItem;
};

export default function BrandNewEditForm({ currentBrand }: Props) {
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();

  const NewBrandSchema = Yup.object().shape({
    name: Yup.string().required(t('required')),
    description: Yup.string(),
    logo: Yup.mixed<any>().required(t('image_required')),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentBrand?.name || '',
      description: currentBrand?.description || '',
      logo: currentBrand?.logo || null,
    }),
    [currentBrand]
  );

  const methods = useForm({
    resolver: yupResolver(NewBrandSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const handleSelectImage = async (urlList) => {
    setValue('logo', urlList?.[0], { shouldValidate: true });
    setImageGalleryOpen(false);
  };

  const onSubmit = handleSubmit(async (data) => {
    const finalData = { ...data };
    try {
      if (currentBrand) {
        await axiosInstance.put(`/brands/${currentBrand.id}/`, finalData);
      } else {
        await axiosInstance.post(`/brands/`, finalData);
      }
      enqueueSnackbar(currentBrand ? t('update_success') : t('create_success'));
      reset();
      router.push(paths.dashboard.brand.root);
    } catch (error) {
      console.error(error);
      // The API answers with { field: [messages] }; anything else gets the generic text.
      const fieldErrors =
        error && typeof error === 'object'
          ? Object.entries(error).filter(([, messages]) => Array.isArray(messages))
          : [];
      if (fieldErrors.length) {
        fieldErrors.forEach(([fieldName, messages]) => {
          (messages as string[]).forEach((errorMsg) => {
            enqueueSnackbar({ variant: 'error', message: `${t(fieldName)}: ${errorMsg}` });
          });
        });
      } else {
        enqueueSnackbar({
          variant: 'error',
          message: error?.detail || error?.error || t('error'),
        });
      }
    }
  });

  const logo = watch('logo');
  const name = watch('name');
  const headerTitle = name || currentBrand?.name || t('create_brand');

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
          onClick={() => router.push(paths.dashboard.brand.root)}
          aria-label="Terug"
          sx={{ border: (theme) => `solid 1px ${theme.palette.divider}`, borderRadius: 1 }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>

        <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
          <Typography variant="h5" noWrap title={headerTitle}>
            {headerTitle}
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {currentBrand ? `ID ${currentBrand.id}` : 'Nog niet opgeslagen'}
          </Typography>
        </Box>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {!currentBrand ? t('create_brand') : t('save_changes')}
        </LoadingButton>
      </Stack>
    </Card>
  );

  const renderGeneral = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle title="Algemeen" hint="Naam en beschrijving van het merk" />
      <Stack spacing={3}>
        <RHFTextField name="name" label={t('name')} />
        <RHFTextField name="description" label={t('description')} multiline minRows={3} />
      </Stack>
    </Card>
  );

  const renderLogo = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle title={t('logo')} hint="Afbeelding uit de mediabibliotheek" />
      <Box
        sx={{
          p: 2,
          aspectRatio: '4 / 3',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.neutral',
          color: 'text.disabled',
          border: (theme) =>
            `dashed 1px ${errors?.logo ? theme.palette.error.main : theme.palette.divider}`,
        }}
      >
        {logo ? (
          <Box
            component="img"
            alt={name}
            src={`${IMAGE_FOLDER_PATH}${logo}`}
            sx={{ width: 1, height: 1, objectFit: 'contain' }}
          />
        ) : (
          <Stack alignItems="center" spacing={0.5}>
            <Iconify icon="solar:gallery-bold" width={32} />
            <Typography variant="caption">Geen logo</Typography>
          </Stack>
        )}
      </Box>
      {errors?.logo && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {errors.logo.message as string}
        </Typography>
      )}
      <Button
        fullWidth
        type="button"
        variant="outlined"
        color="inherit"
        startIcon={<Iconify icon="solar:gallery-add-bold" />}
        onClick={() => setImageGalleryOpen(true)}
        sx={{ mt: 1.5 }}
      >
        {logo ? 'Logo wijzigen' : 'Logo kiezen'}
      </Button>
    </Card>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHeader}

      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="flex-start" spacing={3}>
        <Box sx={{ flex: '1 1 0', minWidth: 0, width: 1 }}>{renderGeneral}</Box>
        <Box sx={{ flex: { md: '0 0 320px' }, width: { xs: 1, md: 320 } }}>{renderLogo}</Box>
      </Stack>

      {isImageGalleryOpen ? (
        <ImageGallery onClose={() => setImageGalleryOpen(false)} onSelect={handleSelectImage} />
      ) : null}
    </FormProvider>
  );
}

// ----------------------------------------------------------------------

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {hint}
      </Typography>
    </Box>
  );
}
