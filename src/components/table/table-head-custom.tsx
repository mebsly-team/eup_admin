import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import { Theme, SxProps, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------

type Props = {
  order?: 'asc' | 'desc';
  orderBy?: string;
  headLabel: any[];
  rowCount?: number;
  numSelected?: number;
  onSort?: (id: string) => void;
  onSelectAllRows?: (checked: boolean) => void;
  sx?: SxProps<Theme>;
};

export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
}: Props) {
  const theme = useTheme();
  const styles = {
    hideOnSm: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    hideOnMd: {
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },
    hideOnMdl: {
      [theme.breakpoints.down('mdl')]: {
        display: 'none',
      },
    },
    hideOnLg: {
      [theme.breakpoints.down('lg')]: {
        display: 'none',
      },
    },
    hideOnXl: {
      [theme.breakpoints.down('xl')]: {
        display: 'none',
      },
    },

  };
  return (
    <TableHead sx={sx}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox" sx={{ padding: 0 }}>
            <Checkbox
              indeterminate={!!numSelected && numSelected < rowCount}
              checked={!!rowCount && numSelected === rowCount}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSelectAllRows(event.target.checked)
              }
            />
          </TableCell>
        )}

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              padding: headCell.padding,
              width: headCell.width,
              ...(headCell.hideOnSm ? styles.hideOnSm : {}),
              ...(headCell.hideOnMd ? styles.hideOnMd : {}),
              ...(headCell.hideOnMdl ? styles.hideOnMdl : {}),
              ...(headCell.hideOnLg ? styles.hideOnLg : {}),
              ...(headCell.hideOnXl ? styles.hideOnXl : {}),
            }}
          >
            {onSort ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onSort(headCell.id)}
              >
                {headCell.label}

                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
