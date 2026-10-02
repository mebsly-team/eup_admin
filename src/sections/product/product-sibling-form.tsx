/* eslint-disable no-nested-ternary */
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';
import ToggleButton from '@mui/material/ToggleButton';
import TableContainer from '@mui/material/TableContainer';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';
import { HOST_API } from 'src/config-global';
import { useGetProduct } from 'src/api/product';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { IProductItem } from 'src/types/product';

import {
  readable,
  formatPrice,
  canEditVisibility,
  VisibilitySwitch,
  RelationTableHead,
} from './product-relation-shared';

type Props = {
  currentProduct?: IProductItem;
  activeTab: any;
};

const unitOrder = ['piece', 'package', 'rol', 'box', 'pallet_layer', 'pallet_full'];
const hostUrl = HOST_API.includes('kooptop') ? 'kooptop.com' : '52.28.100.129:3000';

const COLOR_NAMES = [
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond",
  "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue",
  "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki",
  "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
  "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray",
  "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold",
  "goldenrod", "gray", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki",
  "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
  "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
  "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon",
  "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
  "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin",
  "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
  "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
  "purple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell",
  "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan", "teal",
  "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen", "mix"
];

const TABLE_HEAD = [
  { label: 'Titel' },
  { label: 'Kleur', width: 140 },
  { label: 'Optie', width: 110 },
  { label: 'Eenheid', width: 100 },
  { label: 'EAN', width: 140 },
  { label: 'Prijs per stuk', align: 'right' as const, width: 120 },
  { label: 'Voorraad', align: 'right' as const, width: 110 },
  { label: 'Particulier', width: 110 },
  { label: 'B2B', width: 70 },
  { label: '', width: 136 },
];

function ColorSwatch({ color }: { color: string }) {
  return (
    <Box
      component="span"
      sx={{
        flexShrink: 0,
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: color,
        border: (theme) => `solid 1px ${theme.palette.divider}`,
      }}
    />
  );
}

export default function ProductSiblingForm({ currentProduct: defaultProduct, activeTab }: Props) {
  const { product: currentProduct } = useGetProduct(defaultProduct.id);
  const router = useRouter();
  const { t } = useTranslate();
  const [isLoading, setIsLoading] = useState(false); // State for the spinner
  const [isWaiting, setIsWaiting] = useState(false); // State for the spinner
  const { enqueueSnackbar } = useSnackbar();
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [currentOptionValues, setCurrentOptionValues] = useState<string[]>([]);
  const [optionDraft, setOptionDraft] = useState('');
  const [currentProductSiblingRows, setCurrentProductSiblingRows] = useState<IProductItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const currentProductSiblingIdList =
    currentProduct?.sibling_products.map((item: { id: any }) => item?.id || item) || [];
  const [radioValue, setRadioValue] = useState(currentProduct?.color ? "color" : "no_color");

  const [ean, setEan] = useState(''); // New state for EAN

  const getSiblings = async () => {
    try {
      setIsLoading(true); // Show the spinner
      console.log('Getting siblings, currentProductSiblingIdList:', currentProductSiblingIdList);
      if (currentProductSiblingIdList?.length) {
        const siblingPromises = currentProductSiblingIdList.map(async (item: any) => {
          try {
            const { data } = await axiosInstance.get(`/products/${item}/?nocache=true`);
            return data;
          } catch (error) {
            console.error(`Error fetching siblings ${item}:`, error);
            return null; // Return null for this siblings
          }
        });

        const siblingList = await Promise.all(siblingPromises);
        console.log('Fetched siblingList:', siblingList);

        // Only add currentProduct if it's not already in the list
        if (currentProduct && !siblingList.some(sibling => sibling?.id === currentProduct.id)) {
          siblingList.push(currentProduct);
        }

        console.log('After pushing currentProduct:', siblingList);
        const filteredSiblings = siblingList.filter((sibling): sibling is IProductItem => sibling !== null);
        console.log('Setting currentProductSiblingRows with:', filteredSiblings);
        setCurrentProductSiblingRows(filteredSiblings.sort((a, b) => a.id - b.id));
      } else {
        console.log('No siblings to fetch, setting empty array');
        setCurrentProductSiblingRows(currentProduct ? [currentProduct].sort((a, b) => a.id - b.id) : []);
      }
    } catch (error) {
      console.error('Error fetching siblings:', error);
    } finally {
      setIsLoading(false); // Hide the spinner when done
    }
  };

  useEffect(() => {
    getSiblings();
  }, [activeTab, currentProductSiblingIdList?.length, currentProduct]);

  const createSiblingsCall = async (parentProduct, clr, sz) => {
    const discount = unitOrder.includes(parentProduct.unit) ? unitOrder.indexOf(parentProduct.unit) * 5 : null;
    const isPalletOrBox = ['box', 'pallet_layer', 'pallet_full'].includes(parentProduct.unit);
    const title = `${parentProduct?.title}${clr ? `-${t(clr)}` : ''}${sz ? `-${t(sz)}` : ''}-${t(parentProduct.unit)}`;
    const data: any = {
      title,
      title_long: title,
      sibling_products: [parentProduct?.id],
      extra_location: parentProduct?.extra_location,
      location: parentProduct?.location,
      color: clr?.replace(/\s+/g, '%'),
      size: sz?.replace(/\s+/g, '%'),
      unit: parentProduct.unit,
      categories: parentProduct?.categories?.map((item) => item.id) || [],
      languages_on_item_package: parentProduct?.languages_on_item_package,
      meta_title: parentProduct?.meta_title,
      meta_description: parentProduct?.meta_description,
      meta_keywords: parentProduct?.meta_keywords,
      size_unit: parentProduct?.size_unit,
      weight_unit: parentProduct?.weight_unit,
      liter_unit: parentProduct?.liter_unit,
      pallet_full_total_number: parentProduct?.pallet_full_total_number,
      pallet_layer_total_number: parentProduct?.pallet_layer_total_number,
      supplier_article_code: parentProduct?.supplier_article_code,
      expiry_date: parentProduct?.expiry_date,
      inhoud_unit: parentProduct?.inhoud_unit,
      extra_etiket_nl: parentProduct?.extra_etiket_nl,
      extra_etiket_fr: parentProduct?.extra_etiket_fr,
    };

    if (parentProduct?.supplier?.id) data.supplier = parentProduct?.supplier?.id;
    if (parentProduct?.brand?.id) data.brand = parentProduct?.brand?.id;
    if (parentProduct?.delivery_time) data.delivery_time = parentProduct?.delivery_time;
    if (parentProduct?.hs_code) data.hs_code = parentProduct?.hs_code;
    if (parentProduct?.vat) data.vat = parentProduct?.vat;
    if (parentProduct?.is_regular !== null) data.is_regular = parentProduct?.is_regular;
    data.price_cost = parentProduct?.price_cost;

    if (discount) {
      data.sibling_discount = discount;
      data.price_per_piece = (Number(parentProduct?.price_per_piece) * (1 - discount / 100)).toFixed(
        2
      );
    }

    if (isPalletOrBox) {
      data.ean = parentProduct?.ean;
      data.article_code = parentProduct?.article_code;
    }

    try {
      const response = await axiosInstance.post('/products/', data);
      return response?.data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const createSiblings = async () => {
    setIsLoading(true);
    try {
      const { data: parentProduct } = await axiosInstance.get(`/products/${currentProduct?.id}/?nocache=true`);
      const siblingPromises = [];

      if (radioValue === 'no_color' && currentOptionValues.length > 0) {
        currentOptionValues.forEach((ov) => {
          siblingPromises.push(createSiblingsCall(parentProduct, null, ov));
        });
      } else if (selectedColors.length && currentOptionValues.length > 0) {
        selectedColors.forEach((color) => {
          currentOptionValues.forEach((ov) => {
            siblingPromises.push(createSiblingsCall(parentProduct, color, ov));
          });
        });
      } else if (selectedColors.length) {
        selectedColors.forEach((color) => {
          siblingPromises.push(createSiblingsCall(parentProduct, color, null));
        });
      } else {
        return;
      }

      const newSiblings = await Promise.all(siblingPromises);
      const successfulSiblings = newSiblings.filter((sibling) => sibling !== null);

      if (successfulSiblings.length > 0) {
        const allSiblings = [...currentProductSiblingRows, ...successfulSiblings];
        const data = allSiblings.map((item) => item.id);
        await axiosInstance.post('/add_sibling_products/', { product_ids: data });
        enqueueSnackbar(t('siblings_created_successfully'));
        getSiblings(); // Refresh the list
      }
    } catch (error) {
      console.log('error', error);
      enqueueSnackbar({ variant: 'error', message: t('error_creating_siblings') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (id: any) => () => {
    router.push(`${paths.dashboard.product.edit(id)}?tab=0`);
    window.location.reload();
  };

  const handleVisibilityChange =
    (row, field: 'is_visible_particular' | 'is_visible_B2B') => async (e) => {
      e.stopPropagation(); // Stop event propagation
      if (!canEditVisibility()) return;

      setIsWaiting(true);
      const newStatus = e.target.checked;
      try {
        await axiosInstance.put(`/products/${row.id}/`, {
          [field]: newStatus,
          title: row.title,
        });
        setCurrentProductSiblingRows((prevRows) =>
          prevRows
            .map((sibling) => (sibling.id === row.id ? { ...sibling, [field]: newStatus } : sibling))
            .sort((a, b) => a.id - b.id)
        );
      } catch (error) {
        console.error('Missing Fields:', error);
        const missingFields: any = Object.values(error)?.[0] || [];
        missingFields.forEach((element) => {
          enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
        });
      } finally {
        setIsWaiting(false);
      }
    };

  const handleDelete = async (id: any) => {
    try {
      await axiosInstance.patch(`/products/${id}/`, {
        is_hidden: true,
        is_visible_particular: false,
        is_visible_B2B: false,
        is_product_active: false,
      });
      enqueueSnackbar(t('delete_success'));
      setCurrentProductSiblingRows(currentProductSiblingRows.filter((row) => row.id !== id));
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: t('error') });
    } finally {
      getSiblings();
    }
  };

  const addToSiblings = async (eanSearch: string) => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.post(`/products/${currentProduct?.id}/add_to_siblings/`, { ean: eanSearch });
      if (response.status === 200) {
        enqueueSnackbar(t('product_added_successfully'));
        setEan(''); // Clear the EAN input
        // Refetch the current product to get updated sibling list
        const { data: updatedProduct } = await axiosInstance.get(`/products/${currentProduct?.id}/?nocache=true`);
        if (updatedProduct?.sibling_products) {
          const siblingPromises = updatedProduct.sibling_products.map(async (item: any) => {
            try {
              const { data } = await axiosInstance.get(`/products/${item?.id || item}/?nocache=true`);
              return data;
            } catch (error) {
              console.error(`Error fetching siblings ${item}:`, error);
              return null;
            }
          });

          const siblingList = await Promise.all(siblingPromises);
          if (currentProduct && !siblingList.some(sibling => sibling?.id === currentProduct.id)) {
            siblingList.push(currentProduct);
          }
          const filteredSiblings = siblingList.filter((sibling): sibling is IProductItem => sibling !== null);
          setCurrentProductSiblingRows(filteredSiblings.sort((a, b) => a.id - b.id));
        }
      } else {
        console.error('Failed to fetch product, status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      enqueueSnackbar({ variant: 'error', message: t('error_adding_product') });
    }
  };


  const removeFromSiblings = async (eanSearch: string) => {
    if (!eanSearch) return;
    try {
      const response = await axiosInstance.post(`/products/${currentProduct?.id}/remove_from_siblings/`, { ean: eanSearch });
      if (response.status === 200) {
        enqueueSnackbar(t('product_removed_successfully'));
        setEan(''); // Clear the EAN input
        // Refetch the current product to get updated sibling list
        const { data: updatedProduct } = await axiosInstance.get(`/products/${currentProduct?.id}/?nocache=true`);
        if (updatedProduct?.sibling_products) {
          const siblingPromises = updatedProduct.sibling_products.map(async (item: any) => {
            try {
              const { data } = await axiosInstance.get(`/products/${item?.id || item}/?nocache=true`);
              return data;
            } catch (error) {
              console.error(`Error fetching siblings ${item}:`, error);
              return null;
            }
          });

          const siblingList = await Promise.all(siblingPromises);
          if (currentProduct && !siblingList.some(sibling => sibling?.id === currentProduct.id)) {
            siblingList.push(currentProduct);
          }
          const filteredSiblings = siblingList.filter((sibling): sibling is IProductItem => sibling !== null);
          setCurrentProductSiblingRows(filteredSiblings.sort((a, b) => a.id - b.id));
        }
      } else {
        console.error('Failed to fetch product, status code:', response.status);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      enqueueSnackbar({ variant: 'error', message: t('error_adding_product') });
    }
  };

  const addOption = () => {
    const value = optionDraft.trim();
    if (!value) return;
    if (!currentOptionValues.includes(value)) {
      setCurrentOptionValues([...currentOptionValues, value]);
    }
    setOptionDraft('');
  };

  const withColor = radioValue === 'color';
  const colorCount = withColor ? selectedColors.length : 0;
  const optionCount = currentOptionValues.length;
  // Mirrors createSiblings: every colour gets every option, or one variant when there are none.
  const newCount = withColor ? colorCount * (optionCount || 1) : optionCount;
  const typeLocked = !!currentProduct?.color;

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems="stretch" spacing={2}>
        <Card sx={{ flex: '2 1 0', minWidth: 0 }}>
          <CardHeader
            title="Nieuwe varianten aanmaken"
            subheader="Varianten zijn losse producten in een andere kleur of uitvoering. Klanten wisselen ertussen op de productpagina."
          />
          <Stack spacing={2} sx={{ p: 3 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={radioValue}
              disabled={typeLocked}
              onChange={(_, value) => value && setRadioValue(value)}
              aria-label={t('selectSiblingType')}
              sx={{ alignSelf: 'flex-start' }}
            >
              <ToggleButton value="color" sx={{ px: 2 }}>
                Met kleur
              </ToggleButton>
              <ToggleButton value="no_color" sx={{ px: 2 }}>
                Zonder kleur
              </ToggleButton>
            </ToggleButtonGroup>

            {withColor ? (
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={COLOR_NAMES}
                value={selectedColors}
                onChange={(_, value) => setSelectedColors(value)}
                getOptionLabel={(option) => t(option)}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ColorSwatch color={option} />
                      <span>{t(option)}</span>
                    </Stack>
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      size="small"
                      variant="outlined"
                      icon={<ColorSwatch color={option} />}
                      label={t(option)}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Kleuren" placeholder="Kleur zoeken" />
                )}
              />
            ) : null}

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
                Opties (bijv. lichtkleur, maat){withColor ? ' — optioneel bij kleuren' : ''}
              </Typography>
              <Stack direction="row" flexWrap="wrap" useFlexGap alignItems="center" spacing={1}>
                {currentOptionValues.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    variant="outlined"
                    onDelete={() =>
                      setCurrentOptionValues(currentOptionValues.filter((item) => item !== value))
                    }
                  />
                ))}
                <TextField
                  size="small"
                  value={optionDraft}
                  onChange={(e) => setOptionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder="Optie typen"
                  inputProps={{ 'aria-label': t('add_option') }}
                  sx={{ width: 160 }}
                />
                <Button
                  variant="outlined"
                  color="inherit"
                  disabled={!optionDraft.trim()}
                  onClick={addOption}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Toevoegen
                </Button>
              </Stack>
            </Box>

            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              alignItems="center"
              justifyContent="space-between"
              spacing={1.5}
              sx={{ pt: 2, borderTop: (theme) => `dashed 1px ${theme.palette.divider}` }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {newCount === 0
                  ? withColor
                    ? 'Kies minstens één kleur.'
                    : 'Voeg minstens één optie toe.'
                  : `Er ${newCount === 1 ? 'wordt 1 variant' : `worden ${newCount} varianten`} aangemaakt${
                      colorCount && optionCount ? ` (${colorCount} kleuren × ${optionCount} opties)` : ''
                    }.`}
              </Typography>
              <LoadingButton
                variant="contained"
                loading={isLoading}
                disabled={newCount === 0}
                onClick={createSiblings}
              >
                {newCount > 1
                  ? `${newCount} varianten aanmaken`
                  : newCount === 1
                    ? '1 variant aanmaken'
                    : 'Varianten aanmaken'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ flex: '1 1 0', minWidth: 0 }}>
          <CardHeader
            title="Bestaand product koppelen"
            subheader="Bestaat de variant al als product? Koppel hem met de EAN."
          />
          <Stack spacing={2} alignItems="flex-start" sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="EAN van het product"
              value={ean}
              onChange={(e) => setEan(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToSiblings(ean);
                }
              }}
            />
            <Button variant="outlined" color="primary" disabled={!ean} onClick={() => addToSiblings(ean)}>
              Product koppelen
            </Button>
          </Stack>
        </Card>
      </Stack>

      <Card sx={{ cursor: isWaiting ? 'wait' : 'default' }}>
        <CardHeader title="Varianten van dit product" sx={{ mb: 2 }} />
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Iconify icon="svg-spinners:8-dots-rotate" />
          </Box>
        ) : (
          <TableContainer>
            <Scrollbar>
              <Table sx={{ minWidth: 1200 }}>
                <RelationTableHead cells={TABLE_HEAD} />
                <TableBody>
                  {currentProductSiblingRows.map((row: any) => {
                    const isCurrent = row.id === currentProduct?.id;
                    const color = readable(row.color);
                    const outOfStock = Number(row.free_stock) <= 0;
                    return (
                      <TableRow key={row.id} hover selected={isCurrent}>
                        <TableCell sx={{ maxWidth: 360 }}>
                          <Link
                            component="button"
                            type="button"
                            color="inherit"
                            variant="subtitle2"
                            onClick={handleEditClick(row.id)}
                            sx={{ textAlign: 'left' }}
                          >
                            {row.title}
                          </Link>
                          {isCurrent ? (
                            <Box>
                              <Label color="primary">Dit product</Label>
                            </Box>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {color ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <ColorSwatch color={color} />
                              <span>{t(color)}</span>
                            </Stack>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>{readable(row.size) || '—'}</TableCell>
                        <TableCell>{t(row.unit)}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                          {row.ean || '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ typography: 'subtitle2', whiteSpace: 'nowrap' }}>
                          {formatPrice(row.price_per_piece)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            whiteSpace: 'nowrap',
                            fontVariantNumeric: 'tabular-nums',
                            ...(outOfStock && { color: 'error.main', fontWeight: 600 }),
                          }}
                        >
                          {outOfStock ? 'Niet op voorraad' : row.free_stock}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <VisibilitySwitch
                            checked={row.is_visible_particular}
                            label={`Zichtbaar voor particulieren: ${row.title}`}
                            onChange={handleVisibilityChange(row, 'is_visible_particular')}
                          />
                          {row.is_visible_particular ? (
                            <Tooltip title={`Bekijk op ${hostUrl}`}>
                              <IconButton
                                size="small"
                                component="a"
                                href={`http://${hostUrl}/product/${row.id}/${row.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Bekijk ${row.title} op ${hostUrl}`}
                              >
                                <Iconify icon="mdi:open-in-new" width={18} />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <VisibilitySwitch
                            checked={row.is_visible_B2B}
                            label={`Zichtbaar voor B2B: ${row.title}`}
                            onChange={handleVisibilityChange(row, 'is_visible_B2B')}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title={t('view_edit')}>
                            <IconButton onClick={handleEditClick(row.id)} aria-label={`Bewerk ${row.title}`}>
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                          </Tooltip>
                          {!isCurrent ? (
                            <>
                              <Tooltip
                                title={
                                  row.ean
                                    ? 'Ontkoppelen (product blijft bestaan)'
                                    : 'Ontkoppelen kan alleen met een EAN'
                                }
                              >
                                <span>
                                  <IconButton
                                    disabled={!row.ean}
                                    onClick={() => removeFromSiblings(row.ean)}
                                    aria-label={`Ontkoppel ${row.title}`}
                                  >
                                    <Iconify icon="solar:link-broken-bold" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Product verwijderen">
                                <IconButton
                                  color="error"
                                  onClick={() => setDeleteTarget(row)}
                                  aria-label={`Verwijder ${row.title}`}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        )}
        <Stack
          direction="row"
          flexWrap="wrap"
          useFlexGap
          spacing={3}
          sx={{ px: 3, py: 2, typography: 'caption', color: 'text.secondary' }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="solar:link-broken-bold" width={16} />
            <span>Ontkoppelen: het product blijft bestaan, maar is geen variant meer</span>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
            <span>Verwijderen: het product verdwijnt uit de winkel en de lijst</span>
          </Stack>
        </Stack>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t('delete')}
        content={`${deleteTarget?.title || ''} verwijderen?`}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(deleteTarget.id);
              setDeleteTarget(null);
            }}
          >
            {t('delete')}
          </Button>
        }
      />
    </Stack>
  );
}
