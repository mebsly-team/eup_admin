import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import axiosInstance from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type FinanceDetails = {
  revenue: number;
  discount: number;
  cost: number;
  profit: number;
  margin_percent: number | null;
  items_without_cost: number;
};

type Props = {
  orderId: string;
  currentOrder: any;
};

export default function OrderDetailsFinance({ orderId, currentOrder }: Props) {
  const [password, setPassword] = useState('');
  // Kept only in memory while the box is open, to refresh after cart edits.
  const [unlockedPassword, setUnlockedPassword] = useState('');
  const [details, setDetails] = useState<FinanceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDetails = useCallback(
    async (pwd: string) => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.post(`/orders/${orderId}/finance-details/`, {
          password: pwd,
        });
        setDetails(response.data);
        setUnlockedPassword(pwd);
        setPassword('');
      } catch (err: any) {
        setDetails(null);
        setUnlockedPassword('');
        setError(err?.detail || 'Finans detayları alınamadı');
      } finally {
        setLoading(false);
      }
    },
    [orderId]
  );

  const handleLock = () => {
    setDetails(null);
    setUnlockedPassword('');
    setError('');
  };

  useEffect(() => {
    handleLock();
  }, [orderId]);

  useEffect(() => {
    if (unlockedPassword) fetchDetails(unlockedPassword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrder?.cart]);

  const renderRow = (label: string, value: string, color?: string) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {label}
      </Box>
      <Box component="span" sx={{ typography: 'subtitle2', color }}>
        {value}
      </Box>
    </Stack>
  );

  return (
    <Card>
      <CardHeader
        title="Finans detay"
        action={
          details && (
            <Button size="small" color="inherit" onClick={handleLock}>
              Kilitle
            </Button>
          )
        }
      />

      {details ? (
        <Stack spacing={1.5} sx={{ p: 3, typography: 'body2' }}>
          {renderRow('Ciro (KDV hariç)', fCurrency(details.revenue) || '€0')}
          {renderRow('Maliyet', fCurrency(details.cost) || '€0')}
          {renderRow(
            'Kâr',
            fCurrency(details.profit) || '€0',
            Number(details.profit) < 0 ? 'error.main' : 'success.main'
          )}
          {renderRow('Marj', details.margin_percent === null ? '-' : `%${details.margin_percent}`)}
          {details.items_without_cost > 0 && (
            <Typography variant="caption" sx={{ color: 'warning.main' }}>
              {details.items_without_cost} üründe maliyet fiyatı yok; maliyete dahil edilmedi.
            </Typography>
          )}
        </Stack>
      ) : (
        <Stack
          component="form"
          direction="row"
          spacing={1}
          sx={{ p: 3 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (password) fetchDetails(password);
          }}
        >
          <TextField
            fullWidth
            size="small"
            type="password"
            label="Şifre"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={!password}
            sx={{ height: 40 }}
          >
            Aç
          </LoadingButton>
        </Stack>
      )}
    </Card>
  );
}
