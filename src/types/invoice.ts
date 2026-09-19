// ----------------------------------------------------------------------

// Shape of the orders embedded in /invoices/<id>/ (backend OrderSerializer, snake_case).
// Only the fields the invoice screens read are typed here.
export type IInvoiceOrder = {
  id: string;
  total: string | number | null;
  sub_total?: string | number | null;
  ordered_date: string;
  snelstart_order_number?: string | null;
  user?: {
    business_name?: string;
    email?: string;
    first_name?: string;
  } | null;
  cart?: {
    items?: { quantity?: number }[];
  } | null;
};

export type IInvoiceTableFilterValue = string | string[] | Date | null;

export type IInvoiceTableFilters = {
  name: string;
  service: string[];
  status: string;
  startDate: Date | null;
  endDate: Date | null;
};

// ----------------------------------------------------------------------

export type IInvoice = {
  id: string;
  created_at: string;
  total_amount: string;
  status: string;
  snelstart_invoice_number: string;
  is_sent_to_snelstart: boolean;
  is_paid: boolean;
  invoice_date?: string;
  user: any;
  orders?: IInvoiceOrder[];
};
