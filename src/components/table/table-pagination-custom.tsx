import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import { Theme, SxProps } from '@mui/material/styles';
import { TablePaginationProps } from '@mui/material/TablePagination';
// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
};

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  page,
  count,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [25, 50, 100],
  sx,
  ...other
}: Props & TablePaginationProps) {
  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(event);
  };
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        ...sx,
      }}
    >
      <Pagination
        count={Math.floor(count / rowsPerPage) + (count % rowsPerPage !== 0 ? 1 : 0)}
        defaultPage={page + 1}
        boundaryCount={2}
        onChange={(e, n) => onPageChange(e, n - 1)}
      />
      <Select
        value={rowsPerPage}
        onChange={handleChangeRowsPerPage}
        inputProps={{
          'aria-label': 'rows per page',
        }}
        sx={{ height: '30px' }}
      >
        {/* Define the rows per page options */}
        <MenuItem value={25}>25</MenuItem>
        <MenuItem value={50}>50</MenuItem>
        <MenuItem value={100}>100</MenuItem>
      </Select>
    </Box>
  );
}
