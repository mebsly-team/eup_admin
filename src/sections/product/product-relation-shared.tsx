import Switch from '@mui/material/Switch';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

// Shared by the Bundels and Varianten tabs of the product edit page.

const VISIBILITY_EDITORS = [
  'info@europowerbv.com',
  'm.sahin@europowerbv.nl',
  'hatice.sahin@europowerbv.nl',
];

export function canEditVisibility() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  return VISIBILITY_EDITORS.includes(currentUser?.email);
}

export const formatPrice = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? `€ ${amount.toFixed(2).replace('.', ',')}`
    : '—';
};

// Colors and options are stored with % in place of spaces.
export const readable = (value?: string | null) => value?.toString().replace(/%/g, ' ') || '';

// ----------------------------------------------------------------------

type HeadCell = { label: string; align?: 'left' | 'right'; width?: number };

export function RelationTableHead({ cells }: { cells: HeadCell[] }) {
  return (
    <TableHead>
      <TableRow>
        {cells.map((cell, index) => (
          <TableCell
            key={cell.label || index}
            align={cell.align || 'left'}
            sx={{ width: cell.width, whiteSpace: 'nowrap' }}
          >
            {cell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ----------------------------------------------------------------------

type VisibilitySwitchProps = {
  checked: boolean;
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function VisibilitySwitch({ checked, label, onChange }: VisibilitySwitchProps) {
  return (
    <Switch
      size="small"
      checked={!!checked}
      disabled={!canEditVisibility()}
      onChange={onChange}
      inputProps={{ 'aria-label': label }}
    />
  );
}
