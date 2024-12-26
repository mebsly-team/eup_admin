import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import { useTranslate } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  status: string;
  backLink: string;
  orderNumber: string;
  createdAt: Date;
  onChangeStatus: (newValue: string) => void;
  handleDownloadInvoice: (value: { doc: string }) => void;
  statusOptions: {
    value: string;
    label: string;
  }[];
};

export default function OrderDetailsToolbar({
  currentOrder,
  backLink,
  statusOptions,
  onChangeStatus,
  handleDownloadInvoice,
  sendToSnelstart
}: Props) {
  const popover = usePopover();
  const { t, onChangeLang } = useTranslate();
  const { id, is_paid, ordered_date, status } = currentOrder;

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton component={RouterLink} href={backLink}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4"> Order {id} </Typography>
              <Label variant="soft" color={is_paid ? 'success' : 'error'}>
                {t(is_paid ? 'paid' : 'unpaid')}
              </Label>
              <Button
                color="inherit"
                variant="outlined"
                endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                onClick={popover.onOpen}
                sx={{ textTransform: 'capitalize' }}
              >
                {t(status)}
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {fDateTime(ordered_date)}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            onClick={() => {
              handleDownloadInvoice({ doc: 'werkbon' });
              onChangeStatus('werkbon');
            }}
          >
            {t('werkbon')}
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            onClick={() => {
              handleDownloadInvoice({ doc: 'pakbon' });
              onChangeStatus('packing');
            }}
          >
            {t('packing')}
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            onClick={handleDownloadInvoice}
          >
            {t('invoice')}
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
            onClick={() => sendToSnelstart({ id })}
          >
            {t('sendToSnelstart')}
          </Button>

          {/* <Button color="inherit" variant="contained" startIcon={<Iconify icon="solar:pen-bold" />}>
            {t('edit')}
          </Button> */}
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === status}
            onClick={() => {
              popover.onClose();
              onChangeStatus(option.value);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
