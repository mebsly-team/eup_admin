/* eslint-disable no-nested-ternary */
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Select, Switch, MenuItem, FormControl } from '@mui/material';
import {
  DataGrid,
  GridRowId,
  GridColDef,
  GridRowModes,
  GridRowModel,
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
};

export default function ProductVariantForm({ currentProduct }: Props) {
  const router = useRouter();
  const { t, onChangeLang } = useTranslate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false); // State for the spinner
  const { enqueueSnackbar } = useSnackbar();
  const [selectedValues1, setSelectedValues1] = useState([]);
  const [selectedValues2, setSelectedValues2] = useState([]);
  const [selectedUnitValues, setSelectedUnitValues] = useState([]);
  const [currentProductVariantRows, setCurrentProductVariantRows] = useState([]);
  console.log('currentProductVariantRows', currentProductVariantRows);
  const currentProductVariantIdList = currentProduct?.variants || [];
  console.log('currentProductVariantIdList', currentProductVariantIdList);

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const getVariants = async () => {
    try {
      setIsLoading(true); // Show the spinner
      if (currentProductVariantIdList?.length) {
        const variantPromises = currentProductVariantIdList.map(async (item) => {
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
  }, [currentProductVariantIdList?.length]);

  const createVariantsCall = async (value1, value2, unitValue) => {
    const title = `${currentProduct?.title}${value1 ? `-${value1}` : ''}${
      value2 ? `-${value2}` : ''
    }-${unitValue}`;
    try {
      const response = await axiosInstance.post('/products/', {
        title,
        is_variant: true,
        parent_product: currentProduct?.id,
      });
      console.log('response', response);
    } catch (error) {
      console.error('Error creating variant:', title);
      console.error('Error:', error);
    }
  };

  const createVariants = () => {
    const values1 = selectedValues1.length > 0 ? selectedValues1 : [null];
    const values2 = selectedValues2.length > 0 ? selectedValues2 : [null];

    values1.forEach((value1) => {
      values2.forEach((value2) => {
        selectedUnitValues.forEach((unitValue) => {
          createVariantsCall(value1, value2, unitValue);
        });
      });
    });
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    router.push(paths.dashboard.product.edit(id));
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    console.log('id', id);
    try {
      const { data } = await axiosInstance.delete(`/products/${id}/`);
      enqueueSnackbar(t('delete_success'));
      setCurrentProductVariantRows(currentProductVariantRows.filter((row) => row.id !== id));
    } catch (error) {
      enqueueSnackbar(t('error'));
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
    { field: 'title', headerName: 'Title', width: 500, editable: false },
    {
      field: 'ean',
      headerName: 'EAN',
      // type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'price_per_piece',
      headerName: 'price_per_piece',
      // type: 'date',
      width: 180,
      editable: true,
    },
    // {
    //   field: 'role',
    //   headerName: 'Department',
    //   width: 220,
    //   editable: true,
    //   type: 'singleSelect',
    //   valueOptions: ['Market', 'Finance', 'Development'],
    // },
    {
      field: 'is_product_active',
      type: 'actions',
      headerName: t('is_product_active'),
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        console.log('row', row);
        return [
          <Switch
            size="small"
            checked={row?.is_product_active}
            // onChange={handleChange}
          />,
        ];
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
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

        return [
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
        ];
      },
    },
  ];

  return (
    <>
      <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
        <Typography sx={{ mb: 2 }}>{t('selectVariantType')}</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '100px auto',
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
            </Select>
          </FormControl>
          <Typography sx={{ mb: 2 }}>{t('size')}</Typography>

          <FormControl sx={{ minWidth: 300 }}>
            <Select
              labelId="id-label"
              id="demo-select-small"
              multiple
              value={selectedValues2}
              onChange={(e) => setSelectedValues2(e.target.value)}
            >
              <MenuItem value="XS">XS</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="M">M</MenuItem>
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="XL">XL</MenuItem>
              <MenuItem value="XXL">XXL</MenuItem>
              <MenuItem value="XS">XS</MenuItem>
            </Select>
          </FormControl>
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
        <IconButton onClick={createVariants} color="primary">
          {t('generate')}
        </IconButton>
      </Box>
      <Box
        sx={{
          height: 500,
          width: '100%',
          '& .actions': {
            color: 'text.secondary',
          },
          '& .textPrimary': {
            color: 'text.primary',
          },
        }}
      >
        {isLoading ? (
          <Iconify icon="svg-spinners:8-dots-rotate" sx={{ mr: -3 }} />
        ) : (
          <DataGrid
            rows={currentProductVariantRows}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
          />
        )}
      </Box>
    </>
  );
}
