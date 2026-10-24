import { useEffect, useState } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export type WhatsAppPhoneOption = { label: string; value?: string | null };

export type WhatsAppShareMethod = 'share' | 'chat';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  title: string;
  filename: string;
  message: string;
  phones: WhatsAppPhoneOption[];
  // Calling code used for numbers written in national format (06..., 0475...).
  defaultCountryCode?: string;
  loadPdf: () => Promise<Blob>;
  onShared?: (method: WhatsAppShareMethod, phone: string) => void;
};

/**
 * Turns a free-form phone number into the digits-only international format wa.me
 * expects: "+31 6 1234 5678", "0031612345678" and "0612345678" all become
 * "31612345678". Returns '' when nothing usable is left.
 */
export function toWhatsAppNumber(raw?: string | null, defaultCountryCode = '31') {
  if (!raw) return '';
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  if (trimmed.startsWith('+')) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) digits = `${defaultCountryCode}${digits.slice(1)}`;
  return digits;
}

/** Calling code for a country name or ISO code, defaulting to the Netherlands. */
export function countryCallingCode(country?: string | null) {
  const value = (country || '').trim().toLowerCase();
  if (['be', 'bel', 'belgie', 'belgië', 'belgium', 'belgique'].includes(value)) return '32';
  if (['de', 'deu', 'duitsland', 'germany', 'deutschland'].includes(value)) return '49';
  if (['fr', 'fra', 'frankrijk', 'france'].includes(value)) return '33';
  return '31';
}

/**
 * Prepares a PDF and hands it to WhatsApp. Two routes, because the browser only
 * opens the share sheet straight from a click (the PDF is built first, in this
 * dialog, so the share button click is still a fresh user gesture):
 * - "Deel via WhatsApp": the OS share sheet with the PDF attached.
 * - "Download + open chat": saves the PDF and opens the WhatsApp chat with the
 *   number and message filled in; the PDF is then dropped into the chat.
 */
export default function WhatsAppShareDialog({
  open,
  onClose,
  title,
  filename,
  message,
  phones,
  defaultCountryCode = '31',
  loadPdf,
  onShared,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState(message);

  const phoneOptions = phones.filter(
    (option, index, self) =>
      option.value && self.findIndex((other) => other.value === option.value) === index
  );

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    setFile(null);
    setError('');
    setText(message);
    // WhatsApp needs a mobile number: prefer one that looks like it (NL 06, BE 04).
    const mobile = phoneOptions.find((option) =>
      /^(316|324)/.test(toWhatsAppNumber(option.value, defaultCountryCode))
    );
    setPhone((mobile || phoneOptions[0])?.value || '');
    setLoading(true);

    loadPdf()
      .then((blob) => {
        if (!cancelled) setFile(new File([blob], filename, { type: 'application/pdf' }));
      })
      .catch((err) => {
        console.error('Error preparing PDF for WhatsApp:', err);
        if (!cancelled) setError('PDF kon niet worden aangemaakt.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Only reload when the dialog opens; the props are rebuilt on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const number = toWhatsAppNumber(phone, defaultCountryCode);

  const canShareFile =
    !!file && typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [file] });

  const handleShare = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], text });
      onShared?.('share', number);
      onClose();
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Share failed:', err);
      setError('Delen is niet gelukt. Gebruik "Download + open chat".');
    }
  };

  const handleOpenChat = () => {
    if (!file) return;

    const url = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    const chatUrl = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    window.open(chatUrl, '_blank', 'noopener');

    onShared?.('chat', number);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {loading && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">PDF wordt aangemaakt…</Typography>
            </Stack>
          )}

          {file && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:file-text-bold" sx={{ color: 'error.main' }} />
              <Typography variant="body2">{filename}</Typography>
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Telefoonnummer"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            helperText={
              number
                ? `WhatsApp: +${number}`
                : 'Geen nummer: je kiest de ontvanger zelf in WhatsApp'
            }
            fullWidth
          />

          {phoneOptions.length > 1 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {phoneOptions.map((option) => (
                <Chip
                  key={option.value as string}
                  size="small"
                  label={`${option.label}: ${option.value}`}
                  variant={option.value === phone ? 'filled' : 'outlined'}
                  onClick={() => setPhone(option.value as string)}
                />
              ))}
            </Stack>
          )}

          <TextField
            label="Bericht"
            value={text}
            onChange={(event) => setText(event.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          {file && !canShareFile && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Deze browser kan geen bestanden delen. De PDF wordt gedownload en de chat geopend;
              sleep de PDF daarna in het WhatsApp-gesprek.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Annuleren
        </Button>
        <Button
          variant={canShareFile ? 'outlined' : 'contained'}
          disabled={!file}
          onClick={handleOpenChat}
          startIcon={<Iconify icon="solar:download-bold" />}
        >
          Download + open chat
        </Button>
        {canShareFile && (
          <Button
            variant="contained"
            color="success"
            onClick={handleShare}
            startIcon={<Iconify icon="ic:baseline-whatsapp" />}
          >
            Deel via WhatsApp
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
