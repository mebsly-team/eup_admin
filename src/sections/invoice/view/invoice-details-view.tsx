import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

  useEffect(() => {
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
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceDetails invoice={currentInvoice} />
    </Container>
  );
}
