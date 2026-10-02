import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { addDays, addMonths, differenceInCalendarDays } from 'date-fns';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';
import { fDate } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import ImageGallery from 'src/components/imageGallery/index.tsx';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { ICampaignItem } from 'src/types/campaign';

import { campaignStatus, CAMPAIGN_STATUS } from './campaign-utils';
import CampaignProductsCard, { fetchProducts, CampaignProduct } from './campaign-products-card';

// The dashboard header is fixed: one bar on small screens, two from lg up.
// Only from md up: the card is not sticky below that and `top` would shift it.
const STICKY_TOP = { md: 64, lg: 128 };

const END_PRESETS = [
  { label: '1 week', end: (start: Date) => addDays(start, 7) },
  { label: '2 weken', end: (start: Date) => addDays(start, 14) },
  { label: '1 maand', end: (start: Date) => addMonths(start, 1) },
];

type Props = {
  currentCampaign?: ICampaignItem;
  // A campaign to copy into a new one ("Dupliceren").
  template?: ICampaignItem;
};

type FormValues = {
  name: string;
  description?: string;
  discount_percentage?: number | null;
  sort_order?: number | null;
};

export default function CampaignNewEditForm({ currentCampaign, template }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslate();
  const source = currentCampaign || template;

  const [isImageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [image, setImage] = useState<string | null>(source?.images?.[0] || null);
  const [isActive, setIsActive] = useState(currentCampaign ? currentCampaign.is_active : !template);
  const [startDate, setStartDate] = useState<Date | null>(
    currentCampaign ? new Date(currentCampaign.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | null>(
    currentCampaign?.end_date ? new Date(currentCampaign.end_date) : null
  );
  const [products, setProducts] = useState<CampaignProduct[]>(
    (source?.products || []).map((id) => ({ id }))
  );
  const [productsLoading, setProductsLoading] = useState(!!source?.products?.length);

  // The campaign only stores product ids; fetch names and images for the list.
  useEffect(() => {
    if (!source?.products?.length) return;
    let cancelled = false;
    fetchProducts(`campaign=${source.id}`)
      .then(({ products: found }) => {
        if (cancelled) return;
        const details = new Map(found.map((product) => [product.id, product]));
        setProducts((prev) => prev.map((product) => details.get(product.id) || product));
      })
      .catch(console.error)
      .finally(() => !cancelled && setProductsLoading(false));
    // eslint-disable-next-line consistent-return
    return () => {
      cancelled = true;
    };
  }, [source?.id]);

  const percentage = Yup.number()
    .transform((value, original) => (original === '' || original === null ? null : value))
    .nullable();

  const CampaignSchema = Yup.object().shape({
    name: Yup.string().trim().required(t('required')).max(255),
    description: Yup.string(),
    discount_percentage: percentage
      .min(0, 'Minimaal 0')
      .max(100, 'Maximaal 100')
      .typeError('Vul een getal in'),
    sort_order: percentage.min(0, 'Minimaal 0').integer('Hele getallen').typeError('Vul een getal in'),
  });

  const defaultValues = useMemo(
    () => ({
      name: template ? `${template.name} (kopie)` : currentCampaign?.name || '',
      description: source?.description || '',
      discount_percentage: Number(source?.discount_percentage) > 0 ? Number(source?.discount_percentage) : null,
      sort_order: source?.sort_order ?? 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source?.id]
  );

  const methods = useForm<FormValues>({
    resolver: yupResolver(CampaignSchema) as any,
    defaultValues,
  });

  const {
    watch,
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const name = watch('name');
  const description = watch('description');
  const discount = Number(watch('discount_percentage'));

  const datesInvalid = !startDate || Number.isNaN(startDate.getTime()) || (!!endDate && Number.isNaN(endDate.getTime()));
  const endBeforeStart = !datesInvalid && !!endDate && endDate <= (startDate as Date);
  const status = campaignStatus(isActive, startDate, endDate);
  const statusMeta = CAMPAIGN_STATUS[status];

  const onSubmit = handleSubmit(async (data) => {
    if (datesInvalid || endBeforeStart) return;
    const body = {
      name: data.name.trim(),
      description: data.description || '',
      discount_percentage: data.discount_percentage ?? null,
      sort_order: data.sort_order ?? 0,
      is_active: isActive,
      start_date: (startDate as Date).toISOString(),
      end_date: endDate ? endDate.toISOString() : null,
      images: image ? [image] : [],
      products: products.map((product) => product.id),
    };

    try {
      if (currentCampaign) {
        await axiosInstance.put(`/campaigns/${currentCampaign.id}/`, body);
      } else {
        await axiosInstance.post(`/campaigns/`, body);
      }
      enqueueSnackbar(currentCampaign ? t('update_success') : t('create_success'));
      router.push(paths.dashboard.campaign.root);
    } catch (error) {
      console.error(error);
      // The API answers with { field: [messages] }; anything else gets the generic text.
      const fieldErrors =
        error && typeof error === 'object'
          ? Object.entries(error).filter(([, messages]) => Array.isArray(messages))
          : [];
      if (!fieldErrors.length) {
        enqueueSnackbar(error?.detail || error?.error || t('error'), { variant: 'error' });
        return;
      }
      fieldErrors.forEach(([fieldName, messages]) => {
        const raw = (messages as string[]).join(' ');
        const message =
          fieldName === 'name' && /exists/i.test(raw) ? 'Er bestaat al een actie met deze naam' : raw;
        if (fieldName in data) setError(fieldName as keyof FormValues, { message });
        enqueueSnackbar(`${t(fieldName)}: ${message}`, { variant: 'error' });
      });
    }
  });

  const headerTitle = name || currentCampaign?.name || t('create_campaign');

  const renderHeader = (
    <Card sx={{ position: { md: 'sticky' }, top: STICKY_TOP, zIndex: 10, mb: 3 }}>
      <Stack direction="row" flexWrap="wrap" useFlexGap alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5 }}>
        <IconButton
          type="button"
          onClick={() => router.push(paths.dashboard.campaign.root)}
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
            <Label variant="soft" color={statusMeta.color} sx={{ flexShrink: 0 }}>
              {statusMeta.label}
            </Label>
          </Stack>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {currentCampaign ? `ID ${currentCampaign.id}` : 'Nog niet opgeslagen'}
          </Typography>
        </Box>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={datesInvalid || endBeforeStart}
        >
          {!currentCampaign ? t('create_campaign') : t('save_changes')}
        </LoadingButton>
      </Stack>
    </Card>
  );

  const renderGeneral = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle title="Algemeen" hint="Titel en ondertitel van de banner" />
      <Stack spacing={3}>
        <RHFTextField name="name" label={t('name')} />
        <RHFTextField name="description" label={t('description')} multiline minRows={2} />
        <RHFTextField
          name="discount_percentage"
          label="Korting (optioneel)"
          type="number"
          inputProps={{ min: 0, max: 100, step: 'any' }}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          helperText='Alleen een label op de banner ("tot 20% korting"). Productprijzen veranderen niet.'
          sx={{ maxWidth: { sm: 280 } }}
        />
      </Stack>
    </Card>
  );

  const periodHint = () => {
    if (datesInvalid) return 'Vul een geldige startdatum in.';
    if (endBeforeStart) return 'De einddatum moet na de startdatum liggen.';
    if (!isActive) return 'De actie staat uit en is niet zichtbaar in de webshop.';
    if (status === 'expired') return 'De einddatum is voorbij: de actie is niet meer zichtbaar.';
    if (status === 'scheduled') return `Wordt automatisch zichtbaar op ${fDate(startDate as Date, 'dd MMM yyyy HH:mm')}.`;
    if (!endDate) return 'Nu zichtbaar. Geen einddatum: de actie loopt door tot je hem uitzet.';
    return `Nu zichtbaar, nog ${Math.max(differenceInCalendarDays(endDate, new Date()), 0)} dagen.`;
  };

  const renderPeriod = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle title="Periode" hint="Wanneer de actie in de webshop staat" />
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <DateTimePicker
            label="Start"
            value={startDate}
            onChange={setStartDate}
            ampm={false}
            format="dd-MM-yyyy HH:mm"
            slotProps={{ textField: { fullWidth: true, error: datesInvalid } }}
          />
          <DateTimePicker
            label="Einde (optioneel)"
            value={endDate}
            onChange={setEndDate}
            ampm={false}
            format="dd-MM-yyyy HH:mm"
            minDateTime={startDate || undefined}
            slotProps={{
              textField: { fullWidth: true, error: endBeforeStart },
              field: { clearable: true },
            }}
          />
        </Stack>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
          <Chip
            label="Geen einddatum"
            color={endDate ? 'default' : 'primary'}
            variant={endDate ? 'outlined' : 'filled'}
            onClick={() => setEndDate(null)}
          />
          {END_PRESETS.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              variant="outlined"
              // Counted from today for a campaign that already started, so it never ends in the past.
              onClick={() =>
                setEndDate(
                  preset.end(startDate && !datesInvalid && startDate > new Date() ? startDate : new Date())
                )
              }
            />
          ))}
        </Stack>

        <FormControlLabel
          control={<Switch checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />}
          label="Actie staat aan"
        />

        <Typography
          variant="body2"
          sx={{ color: datesInvalid || endBeforeStart ? 'error.main' : 'text.secondary' }}
        >
          {periodHint()}
        </Typography>
      </Stack>
    </Card>
  );

  const renderImage = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle title={t('image')} hint="Afbeelding uit de mediabibliotheek" />
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
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
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
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          fullWidth
          type="button"
          variant="outlined"
          color="inherit"
          data-testid="campaign-image-upload-button"
          startIcon={<Iconify icon="solar:gallery-add-bold" />}
          onClick={() => setImageGalleryOpen(true)}
        >
          {image ? 'Afbeelding wijzigen' : 'Afbeelding kiezen'}
        </Button>
        {image && (
          <IconButton type="button" onClick={() => setImage(null)} aria-label="Afbeelding verwijderen">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        )}
      </Stack>
    </Card>
  );

  const renderPreview = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle title="Voorbeeld" hint="Zo staat de banner in de webshop" />
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ p: 2, minHeight: 150, borderRadius: 1, bgcolor: 'background.neutral' }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 0' }}>
          <Typography
            variant="subtitle1"
            sx={{ textTransform: 'uppercase', lineHeight: 1.2, wordBreak: 'break-word' }}
          >
            {name || 'Naam van de actie'}
          </Typography>
          {discount > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textTransform: 'uppercase' }}>
              tot{' '}
              <Box component="span" sx={{ color: 'primary.main', typography: 'subtitle1' }}>
                {discount}%
              </Box>{' '}
              korting
            </Typography>
          )}
          {description && (
            <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
              {description}
            </Typography>
          )}
          {endDate && !datesInvalid && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Geldig t/m {fDate(endDate, 'd MMMM')}
            </Typography>
          )}
          <Box
            sx={{
              mt: 1,
              px: 1.25,
              py: 0.5,
              borderRadius: 0.75,
              display: 'inline-block',
              typography: 'caption',
              fontWeight: 700,
              color: 'primary.contrastText',
              bgcolor: 'primary.main',
            }}
          >
            NU KOPEN
          </Box>
        </Box>
        {image && (
          <Box
            component="img"
            alt=""
            src={`${IMAGE_FOLDER_PATH}${image}`}
            sx={{ width: 110, height: 110, objectFit: 'contain', flexShrink: 0 }}
          />
        )}
      </Stack>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
        {products.length
          ? `De knop opent de ${products.length} gekozen producten.`
          : `De knop zoekt in de webshop op "${name || '…'}".`}
      </Typography>

      <RHFTextField
        name="sort_order"
        label="Volgorde"
        type="number"
        size="small"
        inputProps={{ min: 0, step: 1 }}
        helperText="Laagste eerst. Bij 3 of meer actieve acties zijn de laatste twee de zijbanners."
        sx={{ mt: 2.5 }}
      />
    </Card>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHeader}

      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="flex-start" spacing={3}>
        <Stack spacing={3} sx={{ flex: '1 1 0', minWidth: 0, width: 1 }}>
          {renderGeneral}
          {renderPeriod}
          <CampaignProductsCard products={products} loading={productsLoading} onChange={setProducts} />
        </Stack>
        <Stack spacing={3} sx={{ flex: { md: '0 0 340px' }, width: { xs: 1, md: 340 } }}>
          {renderImage}
          {renderPreview}
        </Stack>
      </Stack>

      {isImageGalleryOpen ? (
        <ImageGallery
          onClose={() => setImageGalleryOpen(false)}
          onSelect={(urlList: string[]) => {
            setImage(urlList?.[0] || null);
            setImageGalleryOpen(false);
          }}
        />
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
