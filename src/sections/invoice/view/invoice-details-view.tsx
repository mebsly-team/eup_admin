import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

import { paths } from 'src/routes/paths';
import axiosInstance from 'src/utils/axios';
import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';

import InvoiceDetails from '../invoice-details';
import { IInvoice } from 'src/types/invoice';

type Props = {
  id: string;
};

export default function InvoiceDetailsView({ id }: Props) {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();

  const [currentInvoice, setCurrentInvoice] = useState<IInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const [orderIdInput, setOrderIdInput] = useState('');

  const fetchInvoice = async () => {
    try {
      const { data } = await axiosInstance.get(`/invoices/${id}/`);
      setCurrentInvoice(data);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleSendToSnelstart = async () => {
    try {
      setSending(true);
      const { data } = await axiosInstance.post(`/invoices/${id}/send_to_snelstart/`);
      enqueueSnackbar(t('invoice_sent_to_snelstart_successfully'), { variant: 'success' });
      setCurrentInvoice((prev) => prev ? { ...prev, is_sent_to_snelstart: true } : null);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Error sending to Snelstart', { variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleAddOrder = async () => {
    if (!orderIdInput) return;
    try {
      setLoading(true);
      await axiosInstance.post(`/invoices/${id}/add_orders/`, { order_ids: [orderIdInput] });
      enqueueSnackbar('Order added successfully', { variant: 'success' });
      setAddOrderOpen(false);
      setOrderIdInput('');
      fetchInvoice();
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error?.response?.data?.error || 'Failed to add order', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleRemoveOrder = async (orderId: string) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/invoices/${id}/remove_orders/`, { order_ids: [orderId] });
      enqueueSnackbar('Order removed successfully', { variant: 'success' });
      fetchInvoice();
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error?.response?.data?.error || 'Failed to remove order', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleGenerateSnelstartId = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/invoices/${id}/generate_snelstart_number/`);
      enqueueSnackbar('Snelstart ID generated successfully', { variant: 'success' });
      fetchInvoice();
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error?.response?.data?.error || 'Failed to generate Snelstart ID', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleUpdateDate = async (newDate: string) => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/invoices/${id}/`, { invoice_date: newDate });
      enqueueSnackbar('Invoice date updated', { variant: 'success' });
      fetchInvoice();
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar('Failed to update invoice date', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleDownloadPreview = async () => {
    try {
      const response = await axiosInstance.get(`/consolidated_invoice/${id}/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_preview_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      enqueueSnackbar('Failed to download preview', { variant: 'error' });
    }
  };

  const handleUpdatePaymentStatus = async (isPaid: boolean) => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/invoices/${id}/`, { is_paid: isPaid });
      enqueueSnackbar('Payment status updated', { variant: 'success' });
      fetchInvoice();
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar('Failed to update payment status', { variant: 'error' });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <LoadingScreen />
      </Box>
    );
  }

  if (!currentInvoice) {
    return <Container>Invoice not found</Container>;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={`Invoice ${currentInvoice.snelstart_invoice_number || currentInvoice.id}`}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('invoice'), href: paths.dashboard.invoice.root },
          { name: currentInvoice.snelstart_invoice_number || currentInvoice.id },
        ]}
        action={
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleDownloadPreview}
              startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            >
              Download Preview
            </Button>
            <Button
              variant="contained"
              color={currentInvoice.is_sent_to_snelstart ? 'success' : 'primary'}
              onClick={handleSendToSnelstart}
              disabled={currentInvoice.is_sent_to_snelstart || sending}
              startIcon={
                <Iconify icon={currentInvoice.is_sent_to_snelstart ? 'eva:checkmark-circle-2-fill' : 'eva:cloud-upload-fill'} />
              }
            >
              {currentInvoice.is_sent_to_snelstart ? t('sent_to_snelstart') : t('send_to_snelstart')}
            </Button>
          </Box>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {currentInvoice.is_sent_to_snelstart && (
        <Alert severity="success" sx={{ mb: 3 }}>
          SNELSTARTA GÖNDERİLDİ
        </Alert>
      )}

      <InvoiceDetails 
        invoice={currentInvoice} 
        onRemoveOrder={handleRemoveOrder}
        onAddOrderClick={() => setAddOrderOpen(true)}
        onUpdateDate={handleUpdateDate}
        onGetSnelstartId={handleGenerateSnelstartId}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />

      <Dialog open={addOrderOpen} onClose={() => setAddOrderOpen(false)}>
        <DialogTitle>Add Order to Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Order ID"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              helperText="Enter the ID of the order you want to add to this invoice."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOrderOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAddOrder} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
