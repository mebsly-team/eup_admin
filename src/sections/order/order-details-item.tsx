import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { fCurrency } from 'src/utils/format-number';

import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { IOrderProductItem } from 'src/types/order';

// ----------------------------------------------------------------------

type Props = {
  taxes: number;
  shipping: number;
  discount: number;
  subTotal: number;
  totalAmount: number;
  items: IOrderProductItem[];
};

export default function OrderDetailsItems({ currentOrder }: Props) {
  const { cart, sub_total, total } = currentOrder;
  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ my: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotaal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(sub_total) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Verzendkosten</Box>
        <Box
          sx={{
            width: 160,
          }}
        >
          {`${fCurrency(cart?.shipping_fee)}`}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Transactiekosten</Box>
        <Box sx={{ width: 160 }}>{fCurrency(cart?.transaction_fee)}</Box>
      </Stack>
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Korting</Box>
        <Box
          sx={{
            width: 160,
          }}
        >
          {`${fCurrency(cart?.cart_discount)}`}
        </Box>
      </Stack>
      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Totaal</Box>
        <Box sx={{ width: 160 }}>{fCurrency(total) || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Card>
      <CardHeader
        title="Details"
        action={
          <IconButton>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        }
      />

      <Stack
        sx={{
          px: 3,
        }}
      >
        <Scrollbar>
          {cart?.items?.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              alignItems="center"
              sx={{
                py: 3,
                minWidth: 640,
                borderBottom: (theme) => `dashed 2px ${theme.palette.background.neutral}`,
              }}
            >
              <Avatar
                src={`${IMAGE_FOLDER_PATH}${item.product.images?.[0]}`}
                variant="rounded"
                sx={{ width: 48, height: 48, mr: 2 }}
              />

              <ListItemText
                primary={item.product.title}
                secondary={item.product.article_code}
                primaryTypographyProps={{
                  typography: 'body2',
                }}
                secondaryTypographyProps={{
                  component: 'span',
                  color: 'text.disabled',
                  mt: 0.5,
                }}
              />

              <Box sx={{ typography: 'body2' }}>x{item.quantity}</Box>

              <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
                {fCurrency(item.product.price_per_unit)}
              </Box>
            </Stack>
          ))}
        </Scrollbar>

        {renderTotal}
      </Stack>
    </Card>
  );
}
