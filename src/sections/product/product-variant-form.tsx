/* eslint-disable no-nested-ternary */
import { useState, useEffect, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Chip, Select, Switch, Button, MenuItem, TextField, FormControl } from '@mui/material';
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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

import { IProductItem } from 'src/types/product';

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

export default function ProductVariantForm({ currentProduct, activeTab }: Props) {
  console.log('currentProduct', currentProduct);
  const router = useRouter();
  const { t, onChangeLang } = useTranslate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false); // State for the spinner
  const [isWaiting, setIsWaiting] = useState(false); // State for the spinner
  const { enqueueSnackbar } = useSnackbar();
  const [selectedValues1, setSelectedValues1] = useState([]);
  const [colorValues, setColorValues] = useState([]);
  const [currentColorValue, setCurrentColorValue] = useState('');
  const [selectedUnitValues, setSelectedUnitValues] = useState([]);
  const [currentProductVariantRows, setCurrentProductVariantRows] = useState([]);
  const currentProductVariantIdList =
    currentProduct?.variants.map((item: { id: any }) => item.id) || [];

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const handleKeyUp = (e: { keyCode: number; target: { value: any } }) => {
    if (e.keyCode === 13) {
      setColorValues((oldState) => [...oldState, e.target.value]);
      setCurrentColorValue('');
    }
  };
  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setCurrentColorValue(e.target.value);
  };
  const handleDelete = (item: never, index: number) => {
    const arr = [...colorValues];
    arr.splice(index, 1);
    setColorValues(arr);
  };
  const getVariants = async () => {
    try {
      setIsLoading(true); // Show the spinner
      if (currentProductVariantIdList?.length) {
        const variantPromises = currentProductVariantIdList.map(async (item: any) => {
          try {
            const { data } = await axiosInstance.get(`/products/${item}/`);
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
        : unitValue === 'box'
          ? 10
          : unitValue === 'pallet_layer'
            ? 15
            : unitValue === 'pallet_full'
              ? 20
              : null;
    const isPalletOrBox = ['box', 'pallet_layer', 'pallet_full'].includes(unitValue);
    const title = `${parentProduct?.title}${value1 ? `-${t(value1)}` : ''}${
      value2 ? `-${t(value2)}` : ''
    }-${t(unitValue)}`;
    const data = {
      title,
      is_variant: true,
      title_long: parentProduct?.title_long,
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
      return response?.data; // Return the created variant
    } catch (error) {
      console.error('Error:', error);
      // Handle error here if needed
      return null; // Return null on error
    }
  };

  const createVariants = async () => {
    setIsLoading(true); // Show the spinner
    const values1 = selectedValues1.length > 0 ? selectedValues1 : [null];
    const values2 = colorValues.length > 0 ? colorValues : [null];
    let parentProduct = {};
    try {
      const response = await axiosInstance.get(`/products/${currentProduct?.id}/`);
      parentProduct = response?.data;

      const variantPromises: any[] = [];

      values1.forEach((value1) => {
        values2.forEach((value2) => {
          selectedUnitValues.forEach((unitValue) => {
            variantPromises.push(createVariantsCall(parentProduct, value1, value2, unitValue));
          });
        });
      });

      const newVariants = await Promise.all(variantPromises);

      // Filter out any null results (errors)
      newVariants.push(currentProduct);
      const successfulVariants = newVariants.filter((variant) => variant !== null);

      if (successfulVariants.length > 0) {
        setCurrentProductVariantRows((prevRows) => [...prevRows, ...successfulVariants]);
      }

      setSelectedUnitValues([]);
    } catch (error) {
      console.log('error', error);
    } finally {
      setIsLoading(false); // Hide the spinner
    }
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    router.push(`${paths.dashboard.product.edit(id)}?tab=0`);
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
      setCurrentProductVariantRows((prevRows) => {
        // Find the index of the existing variant
        const variantIndex = prevRows.findIndex((variant) => variant.id === row.id);
        const updatedRows = [...prevRows];
        updatedRows[variantIndex] = { ...row, is_visible_particular: newStatus };
        return updatedRows;
      });
    } catch (error) {
      console.error('Missing Fields:', error);
      const missingFields = Object.values(error)?.[0] || [];
      missingFields.forEach((element) => {
        enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
      });
    } finally {
      // getVariants();
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
      setCurrentProductVariantRows((prevRows) => {
        // Find the index of the existing variant
        const variantIndex = prevRows.findIndex((variant) => variant.id === row.id);
        const updatedRows = [...prevRows];
        updatedRows[variantIndex] = { ...row, is_visible_B2B: newStatus };
        return updatedRows;
      });
    } catch (error) {
      console.error('Missing Fields:', error);
      const missingFields = Object.values(error)?.[0] || [];
      missingFields.forEach((element) => {
        enqueueSnackbar({ variant: 'error', message: `${t(element)} verplicht` });
      });
    } finally {
      // getVariants();
      setIsWaiting(false);
    }
  };
  const handleDeleteClick = (id: GridRowId) => async () => {
    try {
      const { data } = await axiosInstance.delete(`/products/${id}/`);
      enqueueSnackbar(t('delete_success'));
      setCurrentProductVariantRows(currentProductVariantRows.filter((row) => row.id !== id));
    } catch (error) {
      enqueueSnackbar({ variant: 'error', message: t('error') });
    } finally {
      getVariants();
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = currentProductVariantRows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setCurrentProductVariantRows(currentProductVariantRows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setCurrentProductVariantRows(
      currentProductVariantRows.map((row) => (row.id === newRow.id ? updatedRow : row))
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
      headerName: t('size'),
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
        <Switch
          size="small"
          checked={row?.is_visible_particular}
          onChange={handleActiveSwitchChange(row)}
        />,
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

        return row.is_variant
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

  const getRowClassName = (row: GridRowModel) => (!row.row.is_variant ? 'variant-row' : '');

  const sortedRows = [...currentProductVariantRows];
  sortedRows?.sort((a, b) => unitOrder.indexOf(a.unit) - unitOrder.indexOf(b.unit));
  return (
    <>
      <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
        <Typography sx={{ mb: 2 }}>{t('selectVariantType')}</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '1rem',
            p: 3,
            borderBottom: `solid 1px ${theme.palette.divider}`,
          }}
        >
          <Typography sx={{ mb: 2 }}>{t('color')}</Typography>
          <FormControl sx={{ minWidth: 300 }}>
            <Select
              multiple
              value={selectedValues1}
              onChange={(e) => setSelectedValues1(e.target.value)}
            >
              <MenuItem value="red">{t('red')}</MenuItem>
              <MenuItem value="blue">{t('blue')}</MenuItem>
              <MenuItem value="green">{t('green')}</MenuItem>
              <MenuItem value="yellow">{t('yellow')}</MenuItem>
              <MenuItem value="brown">{t('brown')}</MenuItem>
              <MenuItem value="pink">{t('pink')}</MenuItem>
              <MenuItem value="purple">{t('purple')}</MenuItem>
              <MenuItem value="black">{t('black')}</MenuItem>
              <MenuItem value="white">{t('white')}</MenuItem>
              <MenuItem value="orange">{t('orange')}</MenuItem>
              <MenuItem value="gray">{t('gray')}</MenuItem>
              <MenuItem value="cyan">{t('cyan')}</MenuItem>
              <MenuItem value="magenta">{t('magenta')}</MenuItem>
              <MenuItem value="turquoise">{t('turquoise')}</MenuItem>
              <MenuItem value="gold">{t('gold')}</MenuItem>
              <MenuItem value="silver">{t('silver')}</MenuItem>
              <MenuItem value="lavender">{t('lavender')}</MenuItem>
              <MenuItem value="maroon">{t('maroon')}</MenuItem>
              <MenuItem value="teal">{t('teal')}</MenuItem>
              <MenuItem value="navy">{t('navy')}</MenuItem>
              <MenuItem value="indigo">{t('indigo')}</MenuItem>
              <MenuItem value="olive">{t('olive')}</MenuItem>
              <MenuItem value="salmon">{t('salmon')}</MenuItem>
              <MenuItem value="peach">{t('peach')}</MenuItem>
              <MenuItem value="violet">{t('violet')}</MenuItem>
              <MenuItem value="coral">{t('coral')}</MenuItem>
              <MenuItem value="lime">{t('lime')}</MenuItem>
              <MenuItem value="beige">{t('beige')}</MenuItem>
              <MenuItem value="khaki">{t('khaki')}</MenuItem>
              <MenuItem value="azure">{t('azure')}</MenuItem>
              <MenuItem value="orchid">{t('orchid')}</MenuItem>
              <MenuItem value="crimson">{t('crimson')}</MenuItem>
              <MenuItem value="fuchsia">{t('fuchsia')}</MenuItem>
              <MenuItem value="ivory">{t('ivory')}</MenuItem>
              <MenuItem value="tan">{t('tan')}</MenuItem>
              <MenuItem value="mint">{t('mint')}</MenuItem>
            </Select>
          </FormControl>
          <Typography sx={{ mb: 2 }}>{t('size')}</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.2rem',
            }}
          >
            <FormControl sx={styles}>
              <TextField
                value={currentColorValue}
                onChange={handleChange}
                onKeyDown={handleKeyUp}
              />
            </FormControl>{' '}
            <div className="container">
              {colorValues.map((item, index) => (
                <Chip size="small" onDelete={() => handleDelete(item, index)} label={item} />
              ))}
            </div>
          </Box>
          <Typography sx={{ mb: 2 }}>{t('unit')}</Typography>
          <FormControl sx={{ minWidth: 300 }}>
            <Select
              name="unit"
              multiple
              value={selectedUnitValues}
              onChange={(e) => setSelectedUnitValues(e.target.value)}
            >
              <MenuItem value="piece">{t('piece')}</MenuItem>
              <MenuItem value="package">{t('package')}</MenuItem>
              <MenuItem value="rol">{t('rol')}</MenuItem>
              <MenuItem value="box">{t('box')}</MenuItem>
              <MenuItem value="pallet_layer">{t('pallet_layer')}</MenuItem>
              <MenuItem value="pallet_full">{t('pallet_full')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={createVariants} color="primary">
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
            '& .variant-row': {
              backgroundColor: 'grey',
              // pointerEvents: 'none',
            },
          }}
        >
          <DataGrid
            rows={sortedRows}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            getRowClassName={getRowClassName}
            hideFooterPagination
          />
        </Box>
      )}
    </>
  );
}
