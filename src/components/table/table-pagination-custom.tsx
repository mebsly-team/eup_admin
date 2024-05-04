import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import { Input, Button } from '@mui/material';
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
  const [goToPage, setGoToPage] = useState();
  useEffect(() => {
    setGoToPage(page + 1);
  }, [page]);
  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(event);
  };

  const handleGoToPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (event.key === 'Enter') {
      if (!isNaN(value) && value > 0 && value <= Math.ceil(count / rowsPerPage)) {
        onPageChange(null, value - 1);
      }
    } else if (!isNaN(value) && value > 0 && value <= Math.ceil(count / rowsPerPage)) {
      setGoToPage(value);
    }
  };

  const handleGoToPage = (e) => {
    onPageChange(e, goToPage - 1);
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
      {page + 1 ? (
        <Pagination
          count={Math.floor(count / rowsPerPage) + (count % rowsPerPage !== 0 ? 1 : 0)}
          page={page + 1}
          boundaryCount={2}
          onChange={(e, n) => onPageChange(e, n - 1)}
        />
      ) : null}

      <Box>
        <Input
          type="number"
          value={goToPage}
          onChange={handleGoToPageChange}
          onKeyDown={handleGoToPageChange}
          sx={{ width: '25px', textAlign: 'right' }}
        />
        <Button variant="text" onClick={handleGoToPage} sx={{ minWidth: 0, width: '40px', p: 0 }}>
          Ga
        </Button>
      </Box>
      <Select
        value={rowsPerPage}
        onChange={handleChangeRowsPerPage}
        inputProps={{
          'aria-label': 'rows per page',
        }}
        sx={{ height: '30px' }}
      >
        {/* Define the rows per page options */}
        {rowsPerPageOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
