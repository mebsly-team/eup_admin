import { ISupplierItem } from './supplier';
import { IProductItem } from './product';

export type IPurchaseStatus = 'pending' | 'completed' | 'cancelled';

export type IPurchaseItem = {
    id: string;
    type?: 'purchase' | 'offer';
    purchase_invoice_date: string;
    created_at: string;
    updated_at: string;
    supplier: number;
    supplier_detail: {
        id: number;
        name: string;
        supplier_code: string;
        logo?: string;
    };
    items: Array<{
        id: string;
        product: number;
        product_detail: {
            id: number;
            title: string;
            images: string[];
            ean: string;
        };
        product_quantity: number;
        product_purchase_price: string;
        vat_rate: number;
    }>;
    total_inc_btw: string;
    total_exc_btw: string;
    total_vat: string;
};

export type IPurchaseTableFilters = {
    name: string;
    status: string[];
    startDate: Date | null;
    endDate: Date | null;
};

export type IPurchaseTableFilterValue = string | string[] | Date | null; 