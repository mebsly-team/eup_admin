import { IOrderItem } from './order';

// ----------------------------------------------------------------------

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
  user: any;
  orders?: IOrderItem[];
};
