import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { ICategoryItem } from 'src/types/category';

import { CategorySelector } from './CategorySelector';

// The dashboard header is fixed: one bar on small screens, two from lg up.
// Only from md up: the card is not sticky below that and `top` would shift it.
const STICKY_TOP = { md: 64, lg: 128 };

const FIELD_GRID_SX = {
  rowGap: 3,
  columnGap: 2,
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
};

type Props = {
  currentCategory?: ICategoryItem;
};

export default function CategoryNewEditForm({ currentCategory }: Props) {
  const router = useRouter();
  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [parentCategory, setParentCategory] = useState();

  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();
  const location = useLocation();

  // Now you can access query parameters from the location object
  const queryParams = new URLSearchParams(location.search);
  const parentId = queryParams.get('parent');
  const [openDialog, setOpenDialog] = useState(false);

  const [radioValue, setRadioValue] = useState(
    parentId || currentCategory?.parent_category ? 'sub' : 'parent'
  );

  const NewCategorySchema = Yup.object().shape({
    name: Yup.string().required(t('required')),
    icon: radioValue === 'parent' && Yup.string().required(t('required')),
    parent_category: radioValue === 'sub' && Yup.mixed().required(t('category_is_required')),
    image: radioValue === 'parent' && Yup.mixed().required(t('image_required')),
  });

  const defaultValues = useMemo(
    () => ({
      // id: currentCategory?.id || null,
      name: currentCategory?.name || '',
      icon: currentCategory?.icon || '',
      image: currentCategory?.image || null,
      data0: currentCategory?.data0 || null,
      data1: currentCategory?.data1 || null,
      data2: currentCategory?.data2 || null,
      data3: currentCategory?.data3 || null,
      data4: currentCategory?.data4 || null,
      data5: currentCategory?.data5 || null,
      data6: currentCategory?.data6 || null,
      data7: currentCategory?.data7 || null,
      parent_category: parentId || currentCategory?.parent_category,
    }),
    [currentCategory]
  );

  const methods = useForm({
    resolver: yupResolver(NewCategorySchema),
    defaultValues,
  });

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    getValues,
    watch,
    formState: { isSubmitting, errors },
    ...rest
  } = methods;

  useEffect(() => {
    if (parentId || currentCategory?.parent_category) getCategoryDetail();
  }, []);

  const handleSelectImage = async (idList) => {
    setValue('image', idList[0], { shouldValidate: true });
    setImageGalleryOpen(false);
  };

  const getCategoryDetail = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/categories/${parentId || currentCategory?.parent_category}/`
      );
      setParentCategory(data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach((errorMessage) => {
          console.error(errorMessage);
          enqueueSnackbar({ variant: 'error', message: errorMessage });
        });
      } else {
        console.error('An unexpected error occurred:', error);
        enqueueSnackbar({ variant: 'error', message: JSON.stringify(error) });
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const selectedParent =
      typeof data?.parent_category === 'object' ? data?.parent_category?.id : data?.parent_category;
    const finalData = {
      ...data,
      // A parent chosen before switching back to "main category" must not be sent.
      parent_category: radioValue === 'sub' ? selectedParent : null,
    };
    try {
      if (currentCategory) {
        const response = await axiosInstance.put(`/categories/${currentCategory?.id}/`, finalData);
      } else {
        const response = await axiosInstance.post(`/categories/`, finalData);
      }
      enqueueSnackbar(currentCategory ? t('update_success') : t('create_success'));

      reset();
      router.push(paths.dashboard.category.root);
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

  const image = watch('image');
  const name = watch('name');
  const isSub = radioValue === 'sub';
  const parentName = parentCategory?.name || getValues('parent_category')?.name;
  const subCategories = currentCategory?.sub_categories || [];
  const headerTitle = name || currentCategory?.name || t('create_category');

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
          onClick={() => router.push(paths.dashboard.category.root)}
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
            <Label variant="soft" color={isSub ? 'default' : 'info'} sx={{ flexShrink: 0 }}>
              {isSub ? t('subcategory') : t('parent_category')}
            </Label>
          </Stack>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {[
              currentCategory && `ID ${currentCategory.id}`,
              currentCategory?.slug && `/${currentCategory.slug}`,
              isSub && parentName && `onder ${parentName}`,
            ]
              .filter(Boolean)
              .join(' · ') || 'Nog niet opgeslagen'}
          </Typography>
        </Box>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {!currentCategory ? t('create_category') : t('save_changes')}
        </LoadingButton>
      </Stack>
    </Card>
  );

  const renderGeneral = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle title="Algemeen" hint="Naam en plaats in de categorieboom" />
      <Stack spacing={3}>
        {!parentId && !currentCategory?.parent_category && (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={radioValue}
            onChange={(_, value) => value && setRadioValue(value)}
            aria-label="Soort categorie"
            sx={{ alignSelf: 'flex-start' }}
          >
            <ToggleButton value="parent" sx={{ px: 2 }}>
              {t('parent_category')}
            </ToggleButton>
            <ToggleButton value="sub" sx={{ px: 2 }}>
              {t('subcategory')}
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        <RHFTextField name="name" label={t('name')} />

        {isSub && (
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: (theme) =>
                  `solid 1px ${errors?.parent_category ? theme.palette.error.main : theme.palette.divider}`,
              }}
            >
              <Iconify icon="solar:folder-bold" sx={{ color: 'text.disabled', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {t('parent_category')}
                </Typography>
                <Typography variant="subtitle2" noWrap>
                  {parentName || 'Nog niet gekozen'}
                </Typography>
              </Box>
              {!parentId && (
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => setOpenDialog(true)}
                >
                  {parentName ? 'Wijzigen' : 'Kiezen'}
                </Button>
              )}
            </Stack>
            {errors?.parent_category && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.parent_category.message}
              </Typography>
            )}

            {openDialog && (
              <CategorySelector
                single
                t={t}
                defaultSelectedCategories={[getValues('parent_category')]}
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSave={(ct) => {
                  setValue('parent_category', ct, { shouldValidate: true });
                  setParentCategory(ct);
                  setOpenDialog(false);
                }}
              />
            )}
          </Box>
        )}
      </Stack>
    </Card>
  );

  const renderLedger = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle
        title="Grootboekrekeningen"
        hint="Rekeningnummers waarop omzet en inkoop van deze categorie worden geboekt"
      />
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
            Omzet
          </Typography>
          <Box sx={FIELD_GRID_SX}>
            <RHFTextField name="data1" label={t('omzetNL')} />
            <RHFTextField name="data7" label={t('omzetNLLaag')} />
            <RHFTextField name="data2" label={t('omzetBinnenEU')} />
            <RHFTextField name="data3" label={t('omzetBuitenEU')} />
          </Box>
        </Box>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}>
            Inkoop
          </Typography>
          <Box sx={FIELD_GRID_SX}>
            <RHFTextField name="data4" label={t('inkoopNL')} />
            <RHFTextField name="data5" label={t('inkoopBinnenEU')} />
            <RHFTextField name="data6" label={t('inkoopBuitenEU')} />
          </Box>
        </Box>
      </Stack>
    </Card>
  );

  const renderAppearance = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle title="Weergave" hint="Afbeelding en icoon in de webshop" />
      <Stack spacing={2.5}>
        <Box>
          <Box
            sx={{
              aspectRatio: '4 / 3',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.neutral',
              color: 'text.disabled',
              border: (theme) =>
                `dashed 1px ${errors?.image ? theme.palette.error.main : theme.palette.divider}`,
            }}
          >
            {image ? (
              <Box
                component="img"
                alt={name}
                src={`${IMAGE_FOLDER_PATH}${image}`}
                sx={{ width: 1, height: 1, objectFit: 'contain' }}
              />
            ) : (
              <Stack alignItems="center" spacing={0.5}>
                <Iconify icon="solar:gallery-bold" width={32} />
                <Typography variant="caption">Geen afbeelding</Typography>
              </Stack>
            )}
          </Box>
          {errors?.image && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.image.message}
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
            {image ? 'Afbeelding wijzigen' : 'Afbeelding kiezen'}
          </Button>
        </Box>

        <RHFTextField name="icon" label={t('icon')} />
      </Stack>
    </Card>
  );

  const renderSubCategories = (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6">{t('subcategorieën')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {subCategories.length}
        </Typography>
      </Stack>

      {subCategories.length ? (
        <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
          {subCategories.map((sub) => (
            <Stack
              key={sub.id}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ py: 1, minWidth: 0 }}
            >
              <Link
                component={RouterLink}
                href={paths.dashboard.category.edit(sub.id)}
                variant="body2"
                color="inherit"
                noWrap
                title={sub.name}
                sx={{ flexGrow: 1 }}
              >
                {sub.name}
              </Link>
              {!!sub.sub_categories?.length && (
                <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                  {sub.sub_categories.length} sub.
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Deze categorie heeft nog geen subcategorieën.
        </Typography>
      )}

      <Button
        fullWidth
        component={RouterLink}
        href={`${paths.dashboard.category.new}?parent=${currentCategory?.id}`}
        variant="outlined"
        color="inherit"
        startIcon={<Iconify icon="mingcute:add-line" />}
        sx={{ mt: 2 }}
      >
        Subcategorie toevoegen
      </Button>
    </Card>
  );

  const hasSide = !isSub || !!currentCategory;

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHeader}

      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="flex-start" spacing={3}>
        <Stack spacing={3} sx={{ flex: '1 1 0', minWidth: 0, width: 1 }}>
          {renderGeneral}
          {!isSub && renderLedger}
        </Stack>

        {hasSide && (
          <Stack spacing={3} sx={{ flex: { md: '0 0 320px' }, width: { xs: 1, md: 320 } }}>
            {!isSub && renderAppearance}
            {currentCategory && renderSubCategories}
          </Stack>
        )}
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
