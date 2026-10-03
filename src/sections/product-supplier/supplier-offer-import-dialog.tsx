import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import axiosInstance from 'src/utils/axios';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Result = {
  rows: number;
  created: number;
  updated: number;
  unchanged: number;
  unmatched: { row: number; key: string }[];
  errors: { row: number; key: string; error: string }[];
  columns: Record<string, string>;
  dry_run: boolean;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onImported: VoidFunction;
  supplierId: number;
  supplierName?: string;
};

const FIELD_LABEL: Record<string, string> = {
  ean: 'EAN',
  supplier_article_code: 'Art.code leverancier',
  article_code: 'Onze artikelcode',
  purchase_price: 'Inkoopprijs',
  stock_free: 'Voorraad vrij',
  stock_total: 'Voorraad totaal',
};

export default function SupplierOfferImportDialog({
  open,
  onClose,
  onImported,
  supplierId,
  supplierName,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [createNew, setCreateNew] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setResult(null);
      setError('');
    }
  }, [open]);

  const send = async (dryRun: boolean) => {
    if (!file) return;
    const form = new FormData();
    form.append('supplier', String(supplierId));
    form.append('file', file);
    form.append('create_new', String(createNew));
    form.append('dry_run', String(dryRun));
    setBusy(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/product-suppliers/import/', form);
      setResult(data);
      if (!dryRun) onImported();
    } catch (err: any) {
      setResult(null);
      setError(err?.error || err?.response?.data?.error || 'Import mislukt');
    } finally {
      setBusy(false);
    }
  };

  const done = result && !result.dry_run;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Prijzen en voorraad importeren{supplierName ? ` — ${supplierName}` : ''}</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            CSV of Excel met per regel een product. Herkende kolommen: EAN, artikelcode leverancier,
            artikelcode, inkoopprijs, voorraad vrij, voorraad totaal (of één kolom “voorraad”).
            Producten worden gevonden op artikelcode leverancier, daarna EAN, daarna onze artikelcode.
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component="label"
              variant="outlined"
              startIcon={<Iconify icon="solar:upload-linear" />}
              disabled={busy}
            >
              Bestand kiezen
              <input
                hidden
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setResult(null);
                  setError('');
                }}
              />
            </Button>
            <Typography variant="body2" noWrap sx={{ color: file ? 'text.primary' : 'text.disabled' }}>
              {file?.name || 'Geen bestand gekozen'}
            </Typography>
          </Stack>

          <FormControlLabel
            control={<Checkbox checked={createNew} onChange={(e) => setCreateNew(e.target.checked)} />}
            label="Ook producten koppelen die nog niet bij deze leverancier staan"
          />

          {error && <Alert severity="error">{error}</Alert>}

          {result && (
            <Alert severity={done ? 'success' : 'info'}>
              <Box sx={{ typography: 'subtitle2', mb: 0.5 }}>
                {done ? 'Import uitgevoerd' : 'Voorbeeld (nog niets opgeslagen)'}
              </Box>
              <Box sx={{ typography: 'body2' }}>
                {result.rows} regels · {result.created} nieuw gekoppeld · {result.updated} bijgewerkt
                · {result.unchanged} ongewijzigd · {result.unmatched.length} niet gevonden
                {result.errors.length ? ` · ${result.errors.length} fouten` : ''}
              </Box>
              <Box sx={{ typography: 'caption', mt: 0.5, color: 'text.secondary' }}>
                Kolommen:{' '}
                {Object.entries(result.columns)
                  .map(([field, header]) => `${FIELD_LABEL[field] || field} ← “${header}”`)
                  .join(', ')}
              </Box>
            </Alert>
          )}

          {result && (result.unmatched.length > 0 || result.errors.length > 0) && (
            <Box
              sx={{
                maxHeight: 180,
                overflow: 'auto',
                typography: 'caption',
                bgcolor: 'background.neutral',
                borderRadius: 1,
                p: 1.5,
              }}
            >
              {result.errors.map((item) => (
                <Box key={`e${item.row}`} sx={{ color: 'error.main' }}>
                  Regel {item.row} ({item.key}): {item.error}
                </Box>
              ))}
              {result.unmatched.map((item) => (
                <Box key={`u${item.row}`}>
                  Regel {item.row}: {item.key} niet gevonden
                </Box>
              ))}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          {done ? 'Sluiten' : 'Annuleren'}
        </Button>
        {!done && (
          <>
            <Button variant="outlined" disabled={!file || busy} onClick={() => send(true)}>
              Voorbeeld
            </Button>
            <Button variant="contained" disabled={!file || busy} onClick={() => send(false)}>
              Importeren
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
