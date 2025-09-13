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
  currentOrder: any;
  backLink: string;
  statusOptions: {
    value: string;
    label: string;
  }[];
  paymentStatusOptions: {
    value: string;
    label: string;
  }[];
  onChangeStatus: (newValue: string) => void;
  onPaymentChangeStatus: (newValue: string) => void;
  handleDownloadDocument: (value: { doc: string }) => void;
  sendToSnelstart: (value: { id: string }) => void;
  handleSendInvoice: (value: { id: string }) => void;
};

export default function OrderDetailsToolbar({
  currentOrder,
  backLink,
  statusOptions,
  onChangeStatus,
  handleDownloadDocument,
  sendToSnelstart,
  handleSendInvoice,
  paymentStatusOptions,
  onPaymentChangeStatus
}: Props) {
  const popoverStatus = usePopover();
  const popover = usePopover();
  const { t, onChangeLang } = useTranslate();
  const { id, is_paid, ordered_date, status, source_host, is_sent_to_snelstart, snelstart_order_number, extra_note } = currentOrder;
  console.log("🚀 ~ currentOrder:", currentOrder)

  const checkHistoryForStatusChange = (statusToCheck: string) => {
    if (!currentOrder?.history || !Array.isArray(currentOrder.history)) {
      return false;
    }

    return currentOrder.history.some((item: any) => {
      if (item.event && typeof item.event === 'string') {
        return item.event.includes(`Status gewijzigd in ${t(statusToCheck)}`);
      }
      return false;
    });
  };

  const checkHistoryForInvoiceDownload = () => {
    if (!currentOrder?.history || !Array.isArray(currentOrder.history)) {
      return false;
    }

    return currentOrder.history.some((item: any) => {
      if (item.event && typeof item.event === 'string') {
        return item.event.includes('Invoice gedownload');
      }
      return false;
    });
  };
  const checkHistoryForInvoiceSent = () => {
    if (!currentOrder?.history || !Array.isArray(currentOrder.history)) {
      return false;
    }

    return currentOrder.history.some((item: any) => {
      if (item.event && typeof item.event === 'string') {
        return item.event.includes('Invoice verzonden naar klant');
      }
      return false;
    });
  };
  const isWerkbonCompleted = checkHistoryForStatusChange('werkbon');
  const isPackingCompleted = checkHistoryForStatusChange('packing');
  const isInvoiceDownloaded = checkHistoryForInvoiceDownload();
  const isInvoiceSent = checkHistoryForInvoiceSent();

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
              <img style={{ height: 16, width: 16 }} src={`/assets/icons/home/${source_host === "europowerbv.com" ? "europowerbv.png" : "kooptop.png"}`} alt="icon" />
              {extra_note === "offer" ? <Label variant="soft" color="info" onClick={popoverStatus.onOpen} sx={{ cursor: "pointer" }}>{t("offer")}</Label> :
                <Label variant="soft" color={is_paid ? 'success' : 'error'} onClick={popoverStatus.onOpen} sx={{ cursor: "pointer" }}>
                  {t(is_paid ? 'paid' : 'unpaid')}
                </Label>}
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
            <Typography variant="h5"> Snelstart order nummer: {snelstart_order_number || ""}
              <IconButton
                color="primary"
                onClick={async () => {
                  try {
                    const response = await fetch(`https://be.kooptop.com/api/orders/${id}/generate_snelstart_number/`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                      }
                    });

                    if (response.ok) {
                      window.location.reload();
                    } else {
                      console.error('Failed to generate snelstart number');
                    }
                  } catch (error) {
                    console.error('Error generating snelstart number:', error);
                  }
                }}
              >
                <Iconify icon="eva:refresh-fill" />
              </IconButton>
            </Typography>
            {/* TODO: add a link to the snelstart order */}
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              {fDateTime(ordered_date)}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="start"
          justifyContent="flex-end"
        >

          {extra_note === "offer" ? <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="eva:email-fill" />}
            onClick={() => handleSendInvoice({ id })}
            sx={{
              backgroundColor: isInvoiceSent ? 'lightgreen' : 'transparent',
              '&:hover': {
                backgroundColor: isInvoiceSent ? 'lightgreen' : undefined,
              }
            }}
          >
            {t('send_offer')}
          </Button> : null}
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            onClick={() => {
              handleDownloadDocument({ doc: 'werkbon' });
              onChangeStatus('werkbon');
            }}
            sx={{
              backgroundColor: isWerkbonCompleted ? 'lightgreen' : 'transparent',
              '&:hover': {
                backgroundColor: isWerkbonCompleted ? 'lightgreen' : undefined,
              }
            }}
          >
            {t('werkbon')}
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            onClick={() => {
              handleDownloadDocument({ doc: 'pakbon' });
              onChangeStatus('packing');
            }}
            disabled={!currentOrder?.delivery_details?.tracking_number}
            sx={{
              backgroundColor: isPackingCompleted ? 'lightgreen' : 'transparent',
              '&:hover': {
                backgroundColor: isPackingCompleted ? 'lightgreen' : undefined,
              }
            }}
          >
            {t('packing')}
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            onClick={() => handleDownloadDocument({ doc: 'invoice' })}
            disabled={!currentOrder?.delivery_details?.tracking_number || !snelstart_order_number}
            sx={{
              backgroundColor: isInvoiceDownloaded ? 'lightgreen' : 'transparent',
              '&:hover': {
                backgroundColor: isInvoiceDownloaded ? 'lightgreen' : undefined,
              }
            }}
          >
            {t('invoice')}
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="eva:email-fill" />}
            onClick={() => handleSendInvoice({ id })}
            disabled={!currentOrder?.delivery_details?.tracking_number || !snelstart_order_number}
            sx={{
              backgroundColor: isInvoiceSent ? 'lightgreen' : 'transparent',
              '&:hover': {
                backgroundColor: isInvoiceSent ? 'lightgreen' : undefined,
              }
            }}
          >
            {t('send_invoice')}
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
            onClick={() => sendToSnelstart({ id })}
            disabled={!currentOrder?.delivery_details?.tracking_number}
            sx={{
              backgroundColor: is_sent_to_snelstart ? 'lightgreen' : 'transparent',
              '&:hover': {
                backgroundColor: is_sent_to_snelstart ? 'lightgreen' : undefined,
              }
            }}
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
      <CustomPopover
        open={popoverStatus.open}
        onClose={popoverStatus.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {paymentStatusOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === (is_paid ? 'paid' : 'unpaid')}
            onClick={() => {
              popoverStatus.onClose();
              onPaymentChangeStatus(option.value);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
