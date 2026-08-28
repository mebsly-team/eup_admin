import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import { useGetDashboardMetrics } from 'src/api/dashboard';
import Iconify from 'src/components/iconify';
import CustomDateRangePicker, { useDateRangePicker } from 'src/components/custom-date-range-picker';
import { fDate } from 'src/utils/format-time';

import EcommerceYearlySales from '../ecommerce-yearly-sales';
import EcommercePaidByCustomer from '../ecommerce-paid-by-customer';
import EcommerceSalesOverview from '../ecommerce-sales-overview';
import EcommerceWidgetSummary from '../ecommerce-widget-summary';
import EcommerceLatestProducts from '../ecommerce-latest-products';
import EcommerceCurrentBalance from '../ecommerce-current-balance';
import EcommerceUnpaidCustomers from '../ecommerce-unpaid-customers';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView() {
  const { user } = useAuthContext();
  const theme = useTheme();
  const settings = useSettingsContext();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const currentYear = new Date().getFullYear();
  const datePicker = useDateRangePicker(new Date(`${currentYear}-01-01`), new Date());

  const { metrics, metricsLoading, metricsError } = useGetDashboardMetrics(
    datePicker.startDate,
    datePicker.endDate
  );

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Dashboard Login
          </Typography>
          <Stack spacing={3}>
            <TextField 
              type="password"
              label="Wachtwoord" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password === '2026') {
                  setIsAuthenticated(true);
                }
              }}
            />
            <Button 
              size="large" 
              variant="contained" 
              onClick={() => {
                if (password === '2026') setIsAuthenticated(true);
              }}
            >
              Toegang tot Dashboard
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (metricsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (metricsError) {
    return (
      <Container sx={{ mt: 5 }}>
        <Card sx={{ p: 3 }}>
          <Typography color="error" variant="h6">Fout bij laden van dashboardgegevens</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {typeof metricsError === 'string' ? metricsError : JSON.stringify(metricsError)}
          </Typography>
        </Card>
      </Container>
    );
  }

  const { 
    total_omzet = 0, 
    total_balance = 0,
    sales_profit = 0,
    total_purchase = 0,
    top_supplier = null,
    purchases_by_supplier = [],
    paid_by_customer = [], 
    unpaid_customers = [],
    yearly_sales = [],
    sales_overview = {},
    current_balance = {},
    latest_products = []
  } = metrics || {};

  const salesOverviewData = [
    {
      label: 'Totale Winst',
      totalAmount: sales_overview.total_profit || 0,
      value: sales_overview.total_profit_percent || 0,
    },
    {
      label: 'Totale Inkomsten',
      totalAmount: sales_overview.total_income || 0,
      value: sales_overview.total_income_percent || 0,
    },
    {
      label: 'Totale Uitgaven',
      totalAmount: sales_overview.total_expenses || 0,
      value: sales_overview.total_expenses_percent || 0,
    }
  ];

  const latestProductsFormatted = latest_products.map((prod: any) => ({
    id: prod.id,
    name: prod.name,
    price: prod.price,
    coverUrl: prod.image,
    priceSale: 0,
    colors: prod.colors || [],
  }));

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4">
          E-Commerce Dashboard
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<Iconify icon="eva:calendar-outline" />}
          onClick={datePicker.onOpen}
        >
          {datePicker.startDate && datePicker.endDate
            ? `${fDate(datePicker.startDate)} - ${fDate(datePicker.endDate)}`
            : 'Selecteer Datumreeks'}
        </Button>
      </Stack>

      <CustomDateRangePicker
        variant="calendar"
        open={datePicker.open}
        startDate={datePicker.startDate}
        endDate={datePicker.endDate}
        onChangeStartDate={datePicker.onChangeStartDate}
        onChangeEndDate={datePicker.onChangeEndDate}
        onClose={datePicker.onClose}
        error={datePicker.error}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <EcommerceWidgetSummary
            title="Totale Omzet"
            percent={0}
            total={total_omzet}
            chart={{
              series: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <EcommerceWidgetSummary
            title="Totaal Saldo"
            percent={0}
            total={total_balance}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <EcommerceWidgetSummary
            title="Verkoopwinst"
            percent={0}
            total={sales_profit}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [40, 70, 75, 70, 50, 28, 7, 64, 38, 27],
            }}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <EcommerceWidgetSummary
            title="Totale Inkoop"
            percent={0}
            total={total_purchase}
            chart={{
              colors: [theme.palette.error.light, theme.palette.error.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <EcommerceWidgetSummary
            title={top_supplier ? `Top Lev.: ${top_supplier.name}` : "Top Leverancier"}
            percent={0}
            total={top_supplier ? top_supplier.total : 0}
            chart={{
              colors: [theme.palette.success.light, theme.palette.success.main],
              series: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <EcommercePaidByCustomer
            title="Betaald per Klant"
            chart={{
              series: paid_by_customer,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <EcommerceYearlySales
            title="Jaarlijkse Verkoop"
            subheader=""
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: yearly_sales,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <EcommerceSalesOverview title="Verkoopoverzicht" data={salesOverviewData} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <EcommercePaidByCustomer
            title="Aankopen per Leverancier"
            chart={{
              series: purchases_by_supplier,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <EcommerceCurrentBalance
            title="Huidig Saldo"
            currentBalance={current_balance.order_total || 0}
            sentAmount={current_balance.refunded || 0}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <EcommerceUnpaidCustomers
            title="Onbetaalde Klanten"
            tableData={unpaid_customers}
            tableLabels={[
              { id: 'name', label: 'Klant' },
              { id: 'email', label: 'E-mail' },
              { id: 'phone', label: 'Telefoon' },
              { id: 'totalAmount', label: 'Totaal Onbetaald', align: 'right' },
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <EcommerceLatestProducts title="Nieuwste Producten" list={latestProductsFormatted} />
        </Grid>
      </Grid>
    </Container>
  );
}
