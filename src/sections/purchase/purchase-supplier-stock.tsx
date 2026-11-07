import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import axiosInstance from 'src/utils/axios';
import { fDateTime } from 'src/utils/format-time';

import { IProductSupplierSummary } from 'src/types/product';

// ----------------------------------------------------------------------

/**
 * Every supplier's price and stock for one product, in the shape the purchase
 * API gives as product_detail.supplier_offers. For items added on the page,
 * whose product comes from the product search without them. undefined when
 * the request failed: the cell then shows no stock instead of a wrong 0.
 */
export async function fetchSupplierOffers(
  productId: number | string
): Promise<IProductSupplierSummary[] | undefined> {
  try {
    const { data } = await axiosInstance.get(
      `/product-suppliers/?product=${productId}&limit=200&ordering=purchase_price`
    );
    const rows: any[] = Array.isArray(data) ? data : data?.results || [];
    return rows.map((row) => ({
      supplier_id: row.supplier,
      supplier_name: row.supplier_detail?.name || '',
      purchase_price: row.purchase_price,
      stock_free: row.stock_free,
      stock_total: row.stock_total,
      stock_updated_at: row.stock_updated_at,
    }));
  } catch (error) {
    console.error('Error fetching supplier offers:', error);
    return undefined;
  }
}

// ----------------------------------------------------------------------

type Props = {
  offers?: IProductSupplierSummary[];
  supplierId?: number | string | null;
  supplierName?: string;
  quantity?: number;
};

/**
 * Free / total stock of the purchase's supplier for one item. "—" when there
 * is no supplier yet, when that supplier has no offer for the product, or when
 * it never reported a stock (an offer entered by hand, without feed or
 * import, stays at 0 / 0 with no update time). Red when the ordered quantity
 * is more than the supplier has free.
 */
export default function PurchaseSupplierStock({ offers, supplierId, supplierName, quantity }: Props) {
  const offer =
    supplierId === null || supplierId === undefined
      ? undefined
      : offers?.find((candidate) => String(candidate.supplier_id) === String(supplierId));

  const free = Number(offer?.stock_free) || 0;
  const total = Number(offer?.stock_total) || 0;
  const known = !!offer && (!!offer.stock_updated_at || free !== 0 || total !== 0);

  if (!known) {
    let reason = 'Kies eerst een leverancier';
    if (supplierId !== null && supplierId !== undefined) {
      reason = `Geen voorraadgegevens van ${supplierName || 'deze leverancier'} voor dit product`;
    }
    return (
      <Tooltip title={reason} placement="left">
        <Typography component="span" variant="body2" sx={{ color: 'text.disabled' }}>
          —
        </Typography>
      </Tooltip>
    );
  }

  const ordered = Number(quantity) || 0;
  const short = ordered > free;

  let color = 'info.dark';
  if (short) color = 'error.main';
  else if (free <= 0) color = 'text.disabled';

  const title = [
    `${supplierName || offer.supplier_name}: ${free} vrij, ${total} totaal`,
    offer.stock_updated_at
      ? `voorraad bijgewerkt ${fDateTime(offer.stock_updated_at, 'dd-MM-yyyy HH:mm')}`
      : '',
    short ? `minder dan het bestelde aantal (${ordered})` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Tooltip title={title} placement="left">
      <Typography
        component="span"
        variant="body2"
        sx={{
          color,
          fontWeight: short ? 600 : 400,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {free} / {total}
      </Typography>
    </Tooltip>
  );
}
