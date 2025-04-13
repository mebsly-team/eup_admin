import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import {
  ICampaignItem,
  ICampaignTableFilters,
  ICampaignTableFilterValue,
} from 'src/types/campaign';

import CampaignTableRow from '../campaign-table-row';
import CampaignTableToolbar from '../campaign-table-toolbar';
import CampaignTableFiltersResult from '../campaign-table-filters-result';

// ----------------------------------------------------------------------

const defaultFilters: ICampaignTableFilters = {
  name: '',
};

// ----------------------------------------------------------------------

export default function CampaignListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [campaignList, setCampaignList] = useState<ICampaignItem[]>([]);
  const [count, setCount] = useState(0);
  const [tableData, setTableData] = useState<ICampaignItem[]>(campaignList);
  const [filters, setFilters] = useState(defaultFilters);
  const { t, onChangeLang } = useTranslate();
  const TABLE_HEAD = [
    { id: 'image', label: t('image') },
    { id: 'name', label: `${t('name')}/${t('description')}` },
    { id: 'discount_percentage', label: t('discount_percentage'), width: 180 },
    // { id: 'start_date', label: `${t('start_date')}/${t('end_date')}`, width: 180 },
    { id: 'is_active', label: t('is_active'), width: 180 },
  ];

  const dataInPage = campaignList.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!campaignList?.length && canReset) || !campaignList?.length;

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  const getAll = async () => {
    const searchFilter = filters.name ? `&search=${filters.name}` : '';
    const orderByParam = table.orderBy
      ? `&ordering=${table.order === 'desc' ? '' : '-'}${table.orderBy}`
      : '';
    const { data } = await axiosInstance.get(
      `/campaigns/?limit=${table.rowsPerPage}&offset=${
        table.page * table.rowsPerPage
      }${searchFilter}${orderByParam}`
    );
    console.log('data', data);
    setCount(data.length || 0);
    setCampaignList(data || []);
  };

  const handleFilters = useCallback(
    (name: string, value: ICampaignTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      const deleteRow = campaignList.filter((row) => row.id !== id);
      const { data } = await axiosInstance.delete(`/campaigns/${id}/`);
      enqueueSnackbar(t('delete_success'));
      getAll();
      // setTableData(deleteRow);

      // table.onUpdatePageDeleteRow(dataInPage?.length);
    },
    [campaignList, enqueueSnackbar, t, getAll]
  );

  const handleDeleteRows = useCallback(async () => {
    const selectedIds = table.selected;
    const promises = selectedIds.map(async (id) => {
      try {
        await axiosInstance.delete(`/campaigns/${id}/`);
      } catch (error) {
        console.error(`Error deleting ID ${id}:`, error);
      }
    });

    try {
      await Promise.all(promises); // Wait for all delete requests to complete
      const remainingRows = tableData.filter((row) => !selectedIds.includes(row.id));
      setTableData(remainingRows); // Update tableData state with remaining rows
      enqueueSnackbar(t('delete_success'));
      getAll(); // Refresh data if needed
    } catch (error) {
      console.error('Error deleting rows:', error);
    }
  }, [tableData, table.selected, enqueueSnackbar, getAll, t]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.campaign.edit(id));
    },
    [router]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('list')}
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('campaign'), href: paths.dashboard.campaign.root },
            { name: t('list') },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.campaign.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('new_campaign')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <CampaignTableToolbar filters={filters} onFilters={handleFilters} />

          {canReset && (
            <CampaignTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={campaignList?.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected?.length}
              rowCount={campaignList?.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  campaignList.map((row) => row.id)
                )
              }
              action={
                <Tooltip title={t('delete')}>
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={campaignList?.length}
                  numSelected={table.selected?.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      campaignList.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {campaignList.map((row) => (
                    <CampaignTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                    />
                  ))}

                  {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, campaignList?.length)}
                  />

                  <TableNoData notFound={notFound} /> */}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={count}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={t('sure_delete_selected_items')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            {t('delete')}
          </Button>
        }
      />
    </>
  );
}
