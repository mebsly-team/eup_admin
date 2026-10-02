import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import { useState } from 'react';

import { fDateTime } from 'src/utils/format-time';
import axiosInstance from 'src/utils/axios';
import { HOST_API } from 'src/config-global';

import { useTranslate } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useAuthContext } from 'src/auth/hooks';

import { ORDER_STATUS_COLOR } from './order-table-row';

// ----------------------------------------------------------------------

type HandlingStep = {
  key: string;
  title: string;
  done: boolean;
  doneNote: string;
  action: string;
  icon: string;
  blockedReason?: string;
  hasMenu?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

type Props = {
  currentOrder: any;
  onBack: () => void;
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
  handleDownloadDocument: (value: { doc?: string; customUrl?: string }) => void;
  sendToSnelstart: (value: { id: string }) => void;
  handleSendInvoice: (value: { id: string, email?: string }) => void;
  handleSendOffer: (value: { id: string }) => void;
  handleAddToLatestInvoice: (value: { id: string }) => void;
  updateOrder: (id: string, data: any) => Promise<any>;
};

export default function OrderDetailsToolbar({
  currentOrder,
  onBack,
  statusOptions,
  onChangeStatus,
  handleDownloadDocument,
  sendToSnelstart,
  handleSendInvoice,
  paymentStatusOptions,
  onPaymentChangeStatus,
  handleSendOffer,
  handleAddToLatestInvoice,
  updateOrder
}: Props) {
  const popoverStatus = usePopover();
  const popover = usePopover();
  const popoverSendInvoice = usePopover();
  const { t, onChangeLang } = useTranslate();
  const { user } = useAuthContext();
  const { id, is_paid, ordered_date, status, source_host, is_sent_to_snelstart, snelstart_order_number, extra_note, is_on_map_planning } = currentOrder;

  const rawInvoiceEmails = [
    { label: 'Email', value: currentOrder?.user?.email },
    { label: 'Invoice Email', value: currentOrder?.user?.invoice_email },
    { label: 'Invoice CC Email', value: currentOrder?.user?.invoice_cc_email }
  ].filter(e => e.value);

  const invoiceEmails = rawInvoiceEmails.filter((item, index, self) =>
    index === self.findIndex((t) => t.value === item.value)
  );

  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState({
    werkbon: false,
    pakbon: false,
    invoice: false,
  });

  const handleDownloadSelected = () => {
    if (selectedDocs.werkbon) {
      handleDownloadDocument({ doc: 'werkbon' });
    }
    if (selectedDocs.pakbon) {
      handleDownloadDocument({ doc: 'pakbon' });
    }
    if (selectedDocs.invoice) {
      handleDownloadDocument({ doc: 'invoice' });
    }
    setOpenDownloadDialog(false);
  };

  const handleUploadBolPakbon = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post(`/upload_bol_pakbon/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        const history = currentOrder.history || [];
        history.push({
          date: new Date(),
          event: `Bol pakbon geüpload door ${user?.email || 'gebruiker'}`,
        });
        const updatedDetails = {
          ...currentOrder.delivery_details,
          bol_pakbon_url: response.data.url
        };
        updateOrder(id, { delivery_details: updatedDetails, history });
      }
    } catch (error) {
      console.error('Error uploading bol pakbon:', error);
    }
  };

  const [isTogglingPlanning, setIsTogglingPlanning] = useState(false);

  const handleToggleMapPlanning = async () => {
    const nextValue = !is_on_map_planning;
    setIsTogglingPlanning(true);
    try {
      const history = Array.isArray(currentOrder.history) ? [...currentOrder.history] : [];
      history.push({
        date: new Date(),
        event: `${nextValue ? 'Toegevoegd aan kaartplanning' : 'Verwijderd uit kaartplanning'} door ${user?.email || 'gebruiker'}`,
      });
      await updateOrder(id, { is_on_map_planning: nextValue, history });
    } catch (error) {
      console.error('Error toggling map planning:', error);
    } finally {
      setIsTogglingPlanning(false);
    }
  };

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
  const checkHistoryForOfferSent = () => {
    if (!currentOrder?.history || !Array.isArray(currentOrder.history)) {
      return false;
    }

    return currentOrder.history.some((item: any) => {
      if (item.event && typeof item.event === 'string') {
        return item.event.includes('Offer verzonden naar klant');
      }
      return false;
    });
  };
  const isWerkbonCompleted = checkHistoryForStatusChange('werkbon');
  const isPackingCompleted = checkHistoryForStatusChange('packing');
  const isInvoiceDownloaded = checkHistoryForInvoiceDownload();
  const isInvoiceSent = checkHistoryForInvoiceSent();
  const isOfferSent = checkHistoryForOfferSent();

  const isBol = source_host === 'bol.com';
  const trackingNumber = currentOrder?.delivery_details?.tracking_number;
  const bolPakbonUrl = currentOrder?.delivery_details?.bol_pakbon_url;

  const invoiceBlockedReason =
    (!isBol && !trackingNumber && 'Track & trace ontbreekt') ||
    (!snelstart_order_number && 'Snelstart-nummer ontbreekt') ||
    '';

  const handleDownloadBolPakbon = () => {
    const history = currentOrder.history || [];
    history.push({
      date: new Date(),
      event: `Bol pakbon gedownload door ${user?.email || 'gebruiker'}`,
    });
    updateOrder(id, { history });

    window.open(
      (bolPakbonUrl.startsWith('http') ? bolPakbonUrl : `${HOST_API}${bolPakbonUrl}`).replace(
        'europower.s3.amazonaws.com',
        'cdn.depotely.com'
      ),
      '_blank'
    );
  };

  const handleSendToSnelstart = () => {
    if (
      is_sent_to_snelstart &&
      !window.confirm(
        `Deze order staat al in Snelstart (factuur ${snelstart_order_number || '?'}). De bestaande boeking wordt verwijderd en opnieuw verzonden. Doorgaan?`
      )
    ) {
      return;
    }
    sendToSnelstart({ id });
  };

  const handleGenerateSnelstartNumber = async () => {
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
  };

  // The handling steps of an order, in the order they are normally done. Nothing
  // enforces that order: a step is only blocked by what it really needs.
  const steps: HandlingStep[] = [
    ...(extra_note === 'offer'
      ? [
          {
            key: 'offer',
            title: 'Offer',
            done: isOfferSent,
            doneNote: 'Verzonden naar klant',
            action: t('send_offer'),
            icon: 'eva:email-fill',
            onClick: () => handleSendOffer({ id }),
          },
        ]
      : []),
    {
      key: 'werkbon',
      title: 'Werkbon',
      done: isWerkbonCompleted,
      doneNote: 'Geprint',
      action: 'Werkbon printen',
      icon: 'solar:printer-minimalistic-bold',
      onClick: () => {
        handleDownloadDocument({ doc: 'werkbon' });
        onChangeStatus('werkbon');
      },
    },
    isBol && bolPakbonUrl
      ? {
          key: 'bol-pakbon',
          title: 'Bol pakbon',
          done: true,
          doneNote: 'Geüpload',
          action: 'Download Bol Pakbon',
          icon: 'solar:download-bold',
          onClick: handleDownloadBolPakbon,
        }
      : {
          key: 'pakbon',
          title: 'Pakbon',
          done: isPackingCompleted,
          doneNote: 'Geprint',
          action: 'Pakbon printen',
          icon: 'solar:printer-minimalistic-bold',
          blockedReason: trackingNumber ? '' : 'Track & trace ontbreekt',
          onClick: () => {
            handleDownloadDocument({ doc: 'pakbon' });
            onChangeStatus('packing');
          },
        },
    ...(isBol && !bolPakbonUrl
      ? [
          {
            key: 'bol-pakbon',
            title: 'Bol pakbon',
            done: false,
            doneNote: '',
            action: 'Upload Bol Pakbon',
            icon: 'solar:upload-bold',
            onUpload: handleUploadBolPakbon,
          },
        ]
      : []),
    ...(isBol && !currentOrder?.invoice
      ? [
          {
            key: 'add-to-invoice',
            title: 'Factuur',
            done: false,
            doneNote: '',
            action: 'Toevoegen aan factuur',
            icon: 'solar:document-add-bold',
            onClick: () => handleAddToLatestInvoice({ id }),
          },
        ]
      : []),
    ...(isBol
      ? []
      : [
          {
            key: 'invoice',
            title: 'Factuur',
            done: isInvoiceDownloaded,
            doneNote: 'Gedownload',
            action: 'Factuur downloaden',
            icon: 'solar:printer-minimalistic-bold',
            blockedReason: invoiceBlockedReason,
            onClick: () => handleDownloadDocument({ doc: 'invoice' }),
          },
          {
            key: 'send-invoice',
            title: 'Factuur verzenden',
            done: isInvoiceSent,
            doneNote: 'Verzonden naar klant',
            action: t('send_invoice'),
            icon: 'eva:email-fill',
            hasMenu: invoiceEmails.length > 1,
            blockedReason:
              invoiceBlockedReason || (invoiceEmails.length === 0 ? 'Geen e-mailadres' : ''),
            onClick: (event: React.MouseEvent<HTMLElement>) => {
              if (invoiceEmails.length === 1) {
                handleSendInvoice({ id, email: invoiceEmails[0].value });
              } else {
                popoverSendInvoice.onOpen(event);
              }
            },
          },
          {
            key: 'snelstart',
            title: 'Snelstart',
            done: !!is_sent_to_snelstart,
            doneNote: 'Geboekt in Snelstart',
            action: t('sendToSnelstart'),
            icon: 'eva:arrow-ios-forward-fill',
            blockedReason: trackingNumber ? '' : 'Track & trace ontbreekt',
            onClick: handleSendToSnelstart,
          },
        ]),
  ];

  const nextStepKey = steps.find((step) => !step.done && !step.blockedReason)?.key;
  const doneCount = steps.filter((step) => step.done).length;

  return (
    <>
      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'flex-start' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton onClick={onBack} aria-label="Terug">
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                Bestelling #{id}
              </Typography>
              <Tooltip title={source_host || 'kooptop.com'}>
                <img
                  style={{ height: 16, width: 16 }}
                  src={`/assets/icons/home/${source_host === 'europowerbv.com' ? 'europowerbv.png' : isBol ? 'bol.ico' : 'kooptop.png'}`}
                  alt={source_host || 'kooptop.com'}
                />
              </Tooltip>
              {extra_note === 'offer' && (
                <Label variant="soft" color="info">
                  Offer
                </Label>
              )}
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              columnGap={2}
              sx={{ typography: 'body2', color: 'text.secondary' }}
            >
              <span>{fDateTime(ordered_date)}</span>
              {!isBol && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <span>Snelstart-nr.</span>
                  <Box
                    component="span"
                    sx={{ color: 'text.primary', typography: 'subtitle2', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {snelstart_order_number || '—'}
                  </Box>
                  <Tooltip title="Snelstart-nummer genereren">
                    <IconButton size="small" color="primary" onClick={handleGenerateSnelstartNumber}>
                      <Iconify icon="eva:refresh-fill" width={18} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} justifyContent={{ md: 'flex-end' }}>
          <Button
            color="inherit"
            variant="outlined"
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={popover.onOpen}
          >
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, mr: 1 }}>
              Status
            </Box>
            <Label variant="soft" color={ORDER_STATUS_COLOR[status] || 'default'} sx={{ cursor: 'inherit' }}>
              {t(status)}
            </Label>
          </Button>

          <Button
            color="inherit"
            variant="outlined"
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
            onClick={popoverStatus.onOpen}
          >
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, mr: 1 }}>
              Betaling
            </Box>
            <Label variant="soft" color={is_paid ? 'success' : 'error'} sx={{ cursor: 'inherit' }}>
              {t(is_paid ? 'paid' : 'unpaid')}
            </Label>
          </Button>

          <Button
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="eva:cloud-download-fill" />}
            onClick={() => setOpenDownloadDialog(true)}
          >
            Download
          </Button>

          {currentOrder?.invoice && (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
              onClick={() =>
                handleDownloadDocument({
                  doc: 'invoice',
                  customUrl: `/consolidated_invoice/${currentOrder.invoice}/`,
                })
              }
            >
              Download Factuur
            </Button>
          )}

          <Button
            color={is_on_map_planning ? 'primary' : 'inherit'}
            variant={is_on_map_planning ? 'soft' : 'outlined'}
            startIcon={
              <Iconify
                icon={is_on_map_planning ? 'solar:map-point-remove-bold' : 'solar:map-point-add-bold'}
              />
            }
            onClick={handleToggleMapPlanning}
            disabled={isTogglingPlanning}
          >
            {is_on_map_planning ? 'Op kaartplanning' : 'Naar kaartplanning'}
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="h6">Afhandeling</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {doneCount} van {steps.length} stappen gedaan
          </Typography>
        </Stack>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5}>
          {steps.map((step, index) => {
            const isNext = step.key === nextStepKey;
            const buttonProps = {
              fullWidth: true,
              disabled: !!step.blockedReason,
              color: (isNext && 'primary') || (step.done && 'success') || 'inherit',
              variant: isNext ? 'contained' : 'outlined',
              startIcon: <Iconify icon={step.icon} />,
              endIcon: step.hasMenu ? <Iconify icon="eva:arrow-ios-downward-fill" /> : undefined,
            } as const;

            return (
              <Stack
                key={step.key}
                spacing={1}
                sx={{
                  p: 1.5,
                  flex: '1 1 180px',
                  borderRadius: 1.5,
                  border: (theme) =>
                    `solid 1px ${
                      (step.done && alpha(theme.palette.success.main, 0.4)) ||
                      (isNext && theme.palette.primary.main) ||
                      theme.palette.divider
                    }`,
                  ...(step.done && {
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  }),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      typography: 'caption',
                      fontWeight: 600,
                      color: step.done || isNext ? 'common.white' : 'text.secondary',
                      bgcolor:
                        (step.done && 'success.main') || (isNext && 'grey.800') || 'background.neutral',
                    }}
                  >
                    {step.done ? <Iconify icon="eva:checkmark-fill" width={16} /> : index + 1}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ ...(!step.done && !isNext && { color: 'text.secondary' }) }}
                  >
                    {step.title}
                  </Typography>
                </Stack>

                <Typography
                  variant="caption"
                  sx={{
                    flexGrow: 1,
                    minHeight: 18,
                    color:
                      (step.blockedReason && 'warning.dark') ||
                      (step.done && 'success.dark') ||
                      'text.secondary',
                    ...(step.blockedReason && { fontWeight: 600 }),
                  }}
                >
                  {step.blockedReason || (step.done && step.doneNote) || (isNext && 'Volgende stap') || ''}
                </Typography>

                {step.onUpload ? (
                  <Button component="label" {...buttonProps}>
                    {step.action}
                    <input type="file" hidden onChange={step.onUpload} accept="application/pdf" />
                  </Button>
                ) : (
                  <Button onClick={step.onClick} {...buttonProps}>
                    {step.action}
                  </Button>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Card>

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
      <CustomPopover
        open={popoverSendInvoice.open}
        onClose={popoverSendInvoice.onClose}
        arrow="top-right"
        sx={{ width: 240 }}
      >
        {invoiceEmails.map((email) => (
          <MenuItem
            key={email.value}
            onClick={() => {
              popoverSendInvoice.onClose();
              handleSendInvoice({ id, email: email.value });
            }}
            sx={{ py: 1 }}
          >
            <Stack spacing={0.5}>
              <Typography variant="body2">{email.label}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {email.value}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </CustomPopover>

      <Dialog open={openDownloadDialog} onClose={() => setOpenDownloadDialog(false)}>
        <DialogTitle>Download PDFs</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedDocs.werkbon}
                  onChange={(e) => setSelectedDocs({ ...selectedDocs, werkbon: e.target.checked })}
                />
              }
              label="Werkbon PDF"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedDocs.pakbon}
                  onChange={(e) => setSelectedDocs({ ...selectedDocs, pakbon: e.target.checked })}
                  disabled={!currentOrder?.delivery_details?.tracking_number}
                />
              }
              label="Pakbon PDF"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedDocs.invoice}
                  onChange={(e) => setSelectedDocs({ ...selectedDocs, invoice: e.target.checked })}
                  disabled={
                    source_host === 'bol.com'
                      ? !snelstart_order_number
                      : !currentOrder?.delivery_details?.tracking_number || !snelstart_order_number
                  }
                />
              }
              label="Factuur PDF"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDownloadDialog(false)}>Cancel</Button>
          <Button onClick={handleDownloadSelected} variant="contained" autoFocus>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
