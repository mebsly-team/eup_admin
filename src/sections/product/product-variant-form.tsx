/* eslint-disable no-nested-ternary */
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import LoadingButton from '@mui/lab/LoadingButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

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

const unitOrder = ['piece', 'rol', 'set', 'zak', 'fles', 'pot', 'package', 'box', 'pallet_layer', 'pallet_full'];

// Discount on the piece price a new bundle starts with.
const BUNDLE_UNITS = [
  { value: 'package', discount: 5 },
  { value: 'box', discount: 10 },
  { value: 'pallet_layer', discount: 15 },
  { value: 'pallet_full', discount: 20 },
];

const TABLE_HEAD = [
  { label: 'Eenheid', width: 150 },
  { label: 'Titel' },
  { label: 'Kleur', width: 90 },
  { label: 'Optie', width: 90 },
  { label: 'EAN', width: 140 },
  { label: 'Aantal', align: 'right' as const, width: 80 },
  { label: 'Prijs per stuk', align: 'right' as const, width: 130 },
  { label: 'Voorraad', align: 'right' as const, width: 100 },
  { label: 'Particulier', width: 90 },
  { label: 'B2B', width: 70 },
  { label: '', width: 96 },
];

export default function ProductVariantForm({ currentProduct, activeTab }: Props) {
  const router = useRouter();
  const { t } = useTranslate();
  const [isLoading, setIsLoading] = useState(false); // State for the spinner
  const [isWaiting, setIsWaiting] = useState(false); // State for the spinner
  const { enqueueSnackbar } = useSnackbar();
  const [selectedUnitValues, setSelectedUnitValues] = useState<string[]>([]);
  const [currentProductVariantRows, setCurrentProductVariantRows] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const currentProductVariantIdList =
    currentProduct?.variants.map((item: { id: any }) => item.id) || [];

  const getVariants = async () => {
    try {
      setIsLoading(true); // Show the spinner
      if (currentProductVariantIdList?.length) {
        const variantPromises = currentProductVariantIdList.map(async (item: any) => {
          try {
            const { data } = await axiosInstance.get(`/products/${item}/?nocache=true`);
            return data;
          } catch (error) {
            console.error(`Error fetching variant ${item}:`, error);
            // Handle the error as needed (e.g., show an error message)
            return null; // Return null for this variant
          }
        });

        const variantList = await Promise.all(variantPromises);
        variantList.push(currentProduct);
        const filteredVariants = variantList.filter((variant) => variant !== null);
        setCurrentProductVariantRows(filteredVariants);
      } else {
        setCurrentProductVariantRows(currentProduct ? [currentProduct] : []);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      // Handle the error as needed (e.g., show an error message)
    } finally {
      setIsLoading(false); // Hide the spinner when done
    }
  };

  useEffect(() => {
    getVariants();
  }, [activeTab, currentProductVariantIdList?.length]);

  const createVariantsCall = async (parentProduct, value1, value2, unitValue) => {
    const discount =
      unitValue === 'package'
        ? 5
        :
        unitValue === 'rol'
          ? 5
          : unitValue === 'box'
            ? 10
            : unitValue === 'pallet_layer'
              ? 15
              : unitValue === 'pallet_full'
                ? 20
                : null;
    const isPalletOrBox = ['box', 'pallet_layer', 'pallet_full'].includes(unitValue);
    const title = `${parentProduct?.title}${value1 ? `-${t(value1)}` : ''}${value2 ? `-${t(value2)}` : ''
      }-${t(unitValue)}`;
    const data: any = {
      title,
      is_variant: true,
      title_long: title,
      parent_product: parentProduct?.id,
      extra_location: parentProduct?.extra_location,
      location: parentProduct?.location,
      color: value1?.replace(/\s+/g, '%'),
      size: value2?.replace(/\s+/g, '%'),
      unit: unitValue,
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
      data.variant_discount = discount;
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
      return response?.data; // Return the created variant
    } catch (error) {
      console.error('Error:', error);
      // Handle error here if needed
      return null; // Return null on error
    }
  };

  const createVariants = async () => {
    setIsLoading(true); // Show the spinner
    let parentProduct: any = {};
    try {
      const response = await axiosInstance.get(`/products/${currentProduct?.id}/?nocache=true`);
      parentProduct = response?.data;

      const variantPromises: any[] = [];

      selectedUnitValues.forEach((unitValue) => {
        variantPromises.push(createVariantsCall(parentProduct, parentProduct.color, parentProduct.size, unitValue));
      });

      const newVariants = await Promise.all(variantPromises);

      // Filter out any null results (errors)
      newVariants.push(currentProduct);
      const successfulVariants = newVariants.filter((variant) => variant !== null);

      if (successfulVariants.length > 0) {
        setCurrentProductVariantRows((prevRows) => [...prevRows, ...successfulVariants]);
      }

      setSelectedUnitValues([]);
      window.location.reload();

    } catch (error) {
      console.log('error', error);
    } finally {
      setIsLoading(false); // Hide the spinner
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
        setCurrentProductVariantRows((prevRows) =>
          prevRows.map((variant) =>
            variant.id === row.id ? { ...variant, [field]: newStatus } : variant
          )
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
      // Refetch the current product to get updated variant list
      const { data: updatedProduct } = await axiosInstance.get(`/products/${currentProduct?.id}/?nocache=true`);
      if (updatedProduct?.variants) {
        const variantPromises = updatedProduct.variants.map(async (item: any) => {
          try {
            const { data } = await axiosInstance.get(`/products/${item?.id || item}/?nocache=true`);
            return data;
          } catch (error) {
            console.error(`Error fetching variant ${item}:`, error);
            return null;
          }
        });

        const variantList = await Promise.all(variantPromises);
        if (currentProduct) {
          variantList.push(currentProduct);
        }
        const filteredVariants = variantList.filter((variant): variant is IProductItem => variant !== null);
        setCurrentProductVariantRows(filteredVariants);
      } else {
        setCurrentProductVariantRows(currentProduct ? [currentProduct] : []);
      }
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: t('error') });
    }
  };

  const mainProduct = currentProductVariantRows.find((item) => !item.is_variant);
  const sortedRows = currentProductVariantRows
    .map((item) => ({
      ...item,
      free_stock: mainProduct
        ? Math.floor(mainProduct.free_stock / (item.quantity_per_unit || 1))
        : item.free_stock,
    }))
    .sort((a, b) => {
      // First sort by unit order, then by id
      const unitComparison = unitOrder.indexOf(a.unit) - unitOrder.indexOf(b.unit);
      return unitComparison === 0 ? a.id - b.id : unitComparison;
    });

  const basePrice = Number(currentProduct?.price_per_piece) || 0;
  const selectedCount = selectedUnitValues.length;

  const toggleUnit = (unit: string) =>
    setSelectedUnitValues((prev) =>
      prev.includes(unit) ? prev.filter((value) => value !== unit) : [...prev, unit]
    );

  return (
    <Stack spacing={2}>
      <Card>
        <CardHeader
          title="Bundel toevoegen"
          subheader="Kies de verpakkingen waarin dit product ook verkocht wordt. De korting op de stukprijs wordt automatisch toegepast."
        />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box
            gap={1.5}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          >
            {BUNDLE_UNITS.map((unit) => {
              const selected = selectedUnitValues.includes(unit.value);
              const existing = currentProductVariantRows.filter(
                (row) => row.is_variant && row.unit === unit.value
              ).length;
              return (
                <ButtonBase
                  key={unit.value}
                  aria-pressed={selected}
                  onClick={() => toggleUnit(unit.value)}
                  sx={{
                    p: 1.75,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    textAlign: 'left',
                    gap: 0.5,
                    borderRadius: 1.25,
                    border: (theme) =>
                      `solid 1px ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: selected ? 'action.selected' : 'background.paper',
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography variant="subtitle2">{t(unit.value)}</Typography>
                    {selected ? (
                      <Label variant="filled" color="primary">
                        Gekozen
                      </Label>
                    ) : existing ? (
                      <Label>{existing}× aanwezig</Label>
                    ) : null}
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {unit.discount}% korting op de stukprijs
                  </Typography>
                  <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {basePrice > 0
                      ? `${formatPrice(basePrice * (1 - unit.discount / 100))} per stuk`
                      : '—'}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>

          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {selectedCount
                ? 'Titel, categorieën, leverancier en btw worden van het hoofdproduct overgenomen.'
                : 'Nog geen verpakking gekozen.'}
            </Typography>
            <LoadingButton
              variant="contained"
              loading={isLoading}
              disabled={!selectedCount}
              onClick={createVariants}
            >
              {selectedCount > 1
                ? `${selectedCount} bundels aanmaken`
                : selectedCount === 1
                  ? '1 bundel aanmaken'
                  : 'Bundels aanmaken'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ cursor: isWaiting ? 'wait' : 'default' }}>
        <CardHeader
          title="Bundels van dit product"
          subheader={
            mainProduct
              ? `Voorraad wordt berekend uit de vrije voorraad van het hoofdproduct (${mainProduct.free_stock ?? 0} stuks).`
              : undefined
          }
          sx={{ mb: 2 }}
        />
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Iconify icon="svg-spinners:8-dots-rotate" />
          </Box>
        ) : (
          <TableContainer>
            <Scrollbar>
              <Table sx={{ minWidth: 1180 }}>
                <RelationTableHead cells={TABLE_HEAD} />
                <TableBody>
                  {sortedRows.map((row) => {
                    const isMain = row.id === currentProduct?.id;
                    const discount = Number(row.variant_discount) || 0;
                    const outOfStock = Number(row.free_stock) <= 0;
                    return (
                      <TableRow key={row.id} hover selected={isMain}>
                        <TableCell>
                          <Typography variant="subtitle2">{t(row.unit)}</Typography>
                          {isMain ? <Label color="primary">{t('main_product')}</Label> : null}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 360 }}>
                          <Link
                            component="button"
                            type="button"
                            color="inherit"
                            variant="body2"
                            onClick={handleEditClick(row.id)}
                            sx={{ textAlign: 'left' }}
                          >
                            {row.title}
                          </Link>
                        </TableCell>
                        <TableCell>{t(readable(row.color))}</TableCell>
                        <TableCell>{readable(row.size)}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                          {row.ean || '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {row.quantity_per_unit}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="subtitle2">{formatPrice(row.price_per_piece)}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {isMain ? 'Basisprijs' : discount ? `${discount}% korting` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            whiteSpace: 'nowrap',
                            fontVariantNumeric: 'tabular-nums',
                            ...(outOfStock && { color: 'error.main', fontWeight: 600 }),
                          }}
                        >
                          {outOfStock ? 'Niet leverbaar' : row.free_stock}
                        </TableCell>
                        <TableCell>
                          <VisibilitySwitch
                            checked={row.is_visible_particular}
                            label={`Zichtbaar voor particulieren: ${row.title}`}
                            onChange={handleVisibilityChange(row, 'is_visible_particular')}
                          />
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
                          {!isMain ? (
                            <Tooltip title={t('delete')}>
                              <IconButton
                                color="error"
                                onClick={() => setDeleteTarget(row)}
                                aria-label={`Verwijder ${row.title}`}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
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
