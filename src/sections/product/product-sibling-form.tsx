/* eslint-disable no-nested-ternary */
import { useState, useEffect, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Chip,
  Radio,
  Select,
  Switch,
  Button,
  MenuItem,
  TextField,
  RadioGroup,
  FormControl,
  useMediaQuery,
  FormControlLabel,
  ListItemIcon,
  Stack,
} from '@mui/material';
import {
  DataGrid,
  GridRowId,
  GridColDef,
  GridRowModes,
  GridRowModel,
  GridCellParams,
  GridRowModesModel,
  GridEventListener,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { HOST_API } from 'src/config-global';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

import { IProductItem } from 'src/types/product';
import { useGetProduct } from 'src/api/product';

type Props = {
  currentProduct?: IProductItem;
  activeTab: any;
};

const styles = {
  formControlRoot: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '300px',
    flexWrap: 'wrap',
    flexDirection: 'row',
    border: '2px solid lightgray',
    padding: 4,
    borderRadius: '4px',
    '&> div.container': {
      gap: '6px',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    '& > div.container > span': {
      backgroundColor: 'gray',
      padding: '1px 3px',
      borderRadius: '4px',
    },
  },
};
const unitOrder = ['piece', 'package', 'rol', 'box', 'pallet_layer', 'pallet_full'];
const hostUrl = HOST_API.includes('kooptop') ? 'kooptop.com' : '52.28.100.129:3000';

export default function ProductSiblingForm({ currentProduct: defaultProduct, activeTab }: Props) {
  const { product: currentProduct } = useGetProduct(defaultProduct.id);
  const router = useRouter();
  const { t, onChangeLang } = useTranslate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false); // State for the spinner
  const [isWaiting, setIsWaiting] = useState(false); // State for the spinner
  const { enqueueSnackbar } = useSnackbar();
  const [selectedColors, setSelectedColors] = useState([]);
  const [currentOptionValues, setCurrentOptionValues] = useState<string[]>([]);
  const [currentProductSiblingRows, setCurrentProductSiblingRows] = useState<IProductItem[]>([]);
  console.log('currentProductSiblingRows', currentProductSiblingRows);
  const currentProductSiblingIdList =
    currentProduct?.sibling_products.map((item: { id: any }) => item?.id || item) || [];
  const isMobile = useMediaQuery('(max-width:600px)');
  const [radioValue, setRadioValue] = useState(currentProduct?.color ? "color" : "no_color");

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
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
    const data = {
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
      data.price_per_piece = parseFloat(
        Number(parentProduct?.price_per_piece) * (1 - discount / 100)
      ).toFixed(2);
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

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    router.push(`${paths.dashboard.product.edit(id)}?tab=0`);
    window.location.reload();
  };

  const handleActiveSwitchChange = (row) => async (e) => {
    e.stopPropagation(); // Stop event propagation
    setIsWaiting(true);
    const newStatus = e.target.checked;
    try {
      const response = await axiosInstance.put(`/products/${row.id}/`, {
        is_visible_particular: newStatus,
        title: row.title,
      });
      setCurrentProductSiblingRows((prevRows) => {
        // Find the index of the existing sibling
        const siblingIndex = prevRows.findIndex((sibling) => sibling.id === row.id);
        const updatedRows = [...prevRows];
        updatedRows[siblingIndex] = { ...row, is_visible_particular: newStatus };
        return updatedRows.sort((a, b) => a.id - b.id);
      });
    } catch (error) {
      console.error('Missing Fields:', error);
      const missingFields = Object.values(error)?.[0] || [];
      missingFields.forEach((element) => {
        enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
      });
    } finally {
      // getSiblings();
      setIsWaiting(false);
    }
  };

  const handleActiveSwitchChange2 = (row) => async (e) => {
    e.stopPropagation(); // Stop event propagation
    setIsWaiting(true);
    const newStatus = e.target.checked;

    try {
      const response = await axiosInstance.put(`/products/${row.id}/`, {
        is_visible_B2B: e.target.checked,
        title: row.title,
      });
      setCurrentProductSiblingRows((prevRows) => {
        // Find the index of the existing sibling
        const siblingIndex = prevRows.findIndex((sibling) => sibling.id === row.id);
        const updatedRows = [...prevRows];
        updatedRows[siblingIndex] = { ...row, is_visible_B2B: newStatus };
        return updatedRows.sort((a, b) => a.id - b.id);
      });
    } catch (error) {
      console.error('Missing Fields:', error);
      const missingFields = Object.values(error)?.[0] || [];
      missingFields.forEach((element) => {
        enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
      });
    } finally {
      // getSiblings();
      setIsWaiting(false);
    }
  };
  const handleDeleteClick = (id: GridRowId) => async () => {
    try {
      const { data } = await axiosInstance.delete(`/products/${id}/`);
      enqueueSnackbar(t('delete_success'));
      setCurrentProductSiblingRows(currentProductSiblingRows.filter((row) => row.id !== id));
    } catch (error) {
      enqueueSnackbar({ siblings: 'error', message: t('error') });
    } finally {
      getSiblings();
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = currentProductSiblingRows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setCurrentProductSiblingRows(currentProductSiblingRows.filter((row) => row.id !== id));
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioValue((event.target as HTMLInputElement).value);
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setCurrentProductSiblingRows(
      currentProductSiblingRows.map((row) => (row.id === newRow.id ? updatedRow : row)).sort((a, b) => a.id - b.id)
    );
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', editable: false, fontSize: 8, resizable: true, flex: 1 },
    {
      field: 'color',
      headerName: t('color'),
      // type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: false,
      renderCell: (params: GridCellParams) => t(params.value),
      resizable: true,
    },
    {
      field: 'size',
      headerName: t('option'),
      // type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: false,
      resizable: true,
    },
    {
      field: 'unit',
      headerName: t('unit'),
      // type: 'number',
      width: 100,
      align: 'left',
      headerAlign: 'left',
      editable: false,
      renderCell: (params: GridCellParams) => t(params.value),
      resizable: true,
    },
    {
      field: 'ean',
      headerName: 'EAN',
      // type: 'number',
      width: 140,
      align: 'left',
      headerAlign: 'left',
      editable: false,
      resizable: true,
    },
    {
      field: 'price_per_piece',
      headerName: t('price_per_piece'),
      // type: 'date',
      width: 100,
      editable: false,
      resizable: true,
    },
    {
      field: 'quantity_per_unit',
      headerName: t('quantity_per_unit'),
      // type: 'date',
      width: 50,
      editable: false,
      resizable: true,
    },
    {
      field: 'free_stock',
      headerName: t('Voorraad'),
      // type: 'date',
      width: 80,
      editable: false,
      resizable: true,
    },
    // {
    //   field: 'role',
    //   headerName: 'Department',
    //   width: 220,
    //   editable: false,
    //   type: 'singleSelect',
    //   valueOptions: ['Market', 'Finance', 'Development'],
    // },
    {
      field: 'is_visible_particular',
      type: 'actions',
      headerName: `${t('is_particular')}?`,
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id, row }) => [
        <>
          <Switch
            size="small"
            checked={row?.is_visible_particular}
            onChange={handleActiveSwitchChange(row)}
          />
          {row?.is_visible_particular && (
            <Iconify
              icon="mdi:open-in-new"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`http://${hostUrl}/product/${row?.id}/${row?.slug}`, '_blank');
              }}
              sx={{ cursor: 'pointer' }}
            />
          )}
        </>
      ],
    },
    {
      field: 'is_visible_B2B',
      type: 'actions',
      headerName: `${t('is_b2b')}?`,
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id, row }) => [
        <Switch
          size="small"
          checked={row?.is_visible_B2B}
          onChange={handleActiveSwitchChange2(row)}
        />,
      ],
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
            // onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return row.id !== currentProduct?.id
          ? [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<RemoveIcon />}
              label="Delete"
              onClick={() => removeFromSiblings(row.ean)}
              color="inherit"
            />,

          ]
          : [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
          ];
      },
    },
  ];
  const mobileColumns = columns.filter(
    (col) =>
      col.field !== 'color' &&
      col.field !== 'size' &&
      col.field !== 'unit' &&
      col.field !== 'ean' &&
      col.field !== 'quantity_per_unit' &&
      col.field !== 'free_stock' &&
      col.field !== 'price_per_piece'
  );
  const getRowClassName = (row: GridRowModel) =>
    !row.row.id === currentProduct?.id ? 'sibling-row' : '';

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

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ my: 2 }}>
        <TextField
          label="EAN"
          value={ean}
          onChange={(e) => setEan(e.target.value)}
          sx={{ width: 200 }}
        />
        <Button variant="contained" onClick={() => addToSiblings(ean)}>
          Product toevoegen
        </Button>
      </Stack>

      <hr />
      <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
        <Typography sx={{ mb: 2 }}>{t('selectSiblingType')}</Typography>
        <Box>
          <RadioGroup value={radioValue} onChange={handleRadioChange}>
            <FormControlLabel
              value="color"
              control={<Radio size="medium" />}
              label={t('color')}
              sx={{ textTransform: 'capitalize' }}
              disabled={!!currentProduct?.color}
            />
            <FormControlLabel value="no_color" control={<Radio size="medium" />} label={t('no_color')} disabled={!!currentProduct?.color}
            />
          </RadioGroup>

          <Box

          >
            {radioValue === 'color' ? (
              <FormControl sx={{ minWidth: 300 }}>
                <Select
                  multiple
                  value={selectedColors}
                  onChange={(e) => setSelectedColors(e.target.value)}
                >
                  {[
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
                    "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"
                  ].map(color => (
                    <MenuItem key={color} value={color}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: color,
                            borderRadius: 0.5,
                            border: '1px solid #ccc'
                          }}
                        />
                      </ListItemIcon>
                      {t(color)}
                    </MenuItem>
                  ))}

                </Select>
              </FormControl>
            ) : null}
          </Box>
          <Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0.2rem',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                {currentOptionValues.map((value, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                    <TextField
                      value={value}
                      onChange={(e) => {
                        const newValues = [...currentOptionValues];
                        newValues[index] = e.target.value;
                        setCurrentOptionValues(newValues);
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Iconify
                      icon="mdi:delete"
                      onClick={() => {
                        const newValues = currentOptionValues.filter((_, i) => i !== index);
                        setCurrentOptionValues(newValues);
                      }}
                      sx={{
                        cursor: 'pointer',
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        fontSize: '16px',
                        color: 'color',
                      }}
                    />
                  </Box>
                ))}
                {(radioValue === 'no_color' || selectedColors.length > 0) && (
                  <>
                    <Button
                      onClick={() => setCurrentOptionValues([...currentOptionValues, ""])}
                      sx={{ minWidth: 'auto' }}
                    >
                      <Iconify icon="mdi:plus" />
                    </Button>
                    {currentOptionValues.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        {t('add_option')}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={createSiblings}
            color="primary"
            disabled={radioValue === 'color' && selectedColors.length === 0}
          >
            {t('generate')}
          </Button>
        </Box>
      </Box>
      {isLoading ? (
        <Iconify icon="svg-spinners:8-dots-rotate" />
      ) : (
        <Box
          sx={{
            cursor: isWaiting ? 'wait' : 'default',
            height: 600,
            width: '100%',
            '& .actions': {
              color: 'text.secondary',
            },
            '& .textPrimary': {
              color: 'text.primary',
            },
            '& .sibling-row': {
              backgroundColor: 'grey',
              // pointerEvents: 'none',
            },
          }}
        >
          {currentProductSiblingRows.length ? <DataGrid
            rows={currentProductSiblingRows}
            columns={isMobile ? mobileColumns : columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            getRowClassName={getRowClassName}
            hideFooterPagination
          /> : null}
        </Box>
      )}
    </>
  );
}
