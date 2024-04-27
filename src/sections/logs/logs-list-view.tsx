import isEqual from 'lodash/isEqual';
import {
  Key,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  ReactPortal,
  ReactElement,
  JSXElementConstructor,
} from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useTable } from 'src/components/table';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IUserItem, IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
// ----------------------------------------------------------------------

const defaultFilters: IUserTableFilters = {
  name: '',
  role: [],
  status: 'all',
};
const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// ----------------------------------------------------------------------

export default function UserListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const [userList, setUserList] = useState<IUserItem[]>([]);
  const [count, setCount] = useState(0);
  const [tableData, setTableData] = useState<IUserItem[]>(userList);
  const [filters, setFilters] = useState(defaultFilters);
  const { t, onChangeLang } = useTranslate();

  const TABLE_HEAD = [{ id: 'action', label: t('action') }];

  const dataInPage = userList.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset = !isEqual(defaultFilters, filters);

  useEffect(() => {
    getAll();
  }, [filters, table.page, table.rowsPerPage, table.orderBy, table.order]);

  const getAll = async () => {
    const { data } = await axiosInstance.get(`/last-n-days-logs/2/`);
    console.log('data', data);
    setCount(data.count || 0);
    setUserList(data || []);
  };

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
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
      const deleteRow = userList.filter((row) => row.id !== id);
      const { data } = await axiosInstance.delete(`/logs/${id}/`);
      enqueueSnackbar(t('delete_success'));

      getAll();
      // setTableData(deleteRow);

      // table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, userList]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar(t('delete_success'));

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: userList.length,
    });
  }, [userList.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.employee.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: t('dashboard'), href: paths.dashboard.root },
            { name: t('employee'), href: paths.dashboard.employee.root },
            { name: t('list') },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          {userList.map((log, i) => (
            <TableContainer key={i} sx={{ mt: 3, overflow: 'unset' }}>
              <Scrollbar>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        {log?.[0]} ({log?.[1]?.length} Log)
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {log?.[1].map(
                      (
                        item:
                          | string
                          | number
                          | boolean
                          | ReactElement<any, string | JSXElementConstructor<any>>
                          | Iterable<ReactNode>
                          | ReactPortal
                          | null
                          | undefined,
                        i: Key | null | undefined
                      ) =>
                        item.match(emailPattern) ? (
                          <TableRow key={i}>
                            <TableCell>{item}</TableCell>
                          </TableRow>
                        ) : null
                    )}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          ))}
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
