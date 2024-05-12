// ----------------------------------------------------------------------

export type IProductFilterValue = string | string[] | number | number[];

export type IProductFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
};

// ----------------------------------------------------------------------

export type IProductReviewNewForm = {
  rating: number | null;
  review: string;
  name: string;
  email: string;
};

export type IProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  helpful: number;
  avatarUrl: string;
  isPurchased: boolean;
  attachments?: string[];
  postedAt: Date;
};

export type IProductTableFilterValue = string | string[];

export type IProductTableFilters = {
  category: any;
  is_product_active: string | undefined;
  name: unknown;
  title: string;
  description: string;
  ean: string;
};

export interface IProductItem {
  id: number;
  campaigns: Campaign[];
  chips: string[];
  variants: any;
  image_urls: string[];
  slug: string;
  title: string;
  title_long: string;
  description: string;
  description_long: string;
  price_per_piece: string | number;
  price_per_unit: number;
  price_consumers: number;
  price_cost: any;
  unit: string;
  quantity_per_unit: number;
  quantity_total_content: number;
  max_order_allowed_per_unit: number;
  pallet_layer_total_number: number;
  pallet_full_total_number: number;
  overall_stock: number;
  free_stock: number;
  ordered_in_progress_stock: number;
  work_in_progress_stock: number;
  parent_price_per_piece: number;
  stock_disable_when_sold_out: boolean;
  variant_discount: number;
  is_variant: boolean;
  is_taken_from_another_package: boolean;
  ean: string;
  article_code: string;
  delivery_time: string;
  location: string;
  extra_location: string;
  size_x_value: any;
  size_y_value: any;
  size_z_value: any;
  liter: any;
  size_unit: string;
  liter_unit: string;
  weight: any;
  weight_unit: string;
  buy_min: any;
  buy_max: any;
  important_information: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  url: string;
  is_used: boolean;
  is_regular: boolean;
  is_featured: boolean;
  is_visible_on_web: boolean;
  is_visible_on_mobile: boolean;
  is_only_for_export: boolean;
  is_only_for_B2B: boolean;
  is_listed_on_marktplaats: boolean;
  is_listed_on_2dehands: boolean;
  is_product_active: boolean;
  is_party_sale: boolean;
  is_clearance: boolean;
  sell_from_supplier: boolean;
  vat: number;
  stock_alert: boolean;
  sku: string;
  supplier_article_code: string;
  hs_code: string;
  has_electronic_barcode: boolean;
  is_brief_box: boolean;
  volume_unit: string;
  volume: string;
  created_at: string;
  expiry_date: any;
  chip: string;
  average_rating: string;
  parent_product?: number;
  languages_on_item_package: number[];
  images: string[];
  supplier: Supplier;
  brand: Brand;
  categories: Category[];
  tags: any[];
}

export interface Campaign {
  id: number;
  is_active: boolean;
  name: string;
  discount_percentage: string;
  start_date: string;
  end_date: string;
  products: number[];
}

export interface Supplier {
  id?: number;
  addresses?: any[];
  name: string;
  contact_person?: string;
  is_active: boolean;
  hasGivenPaymentAuth: boolean;
  percentage_to_add: any;
  supplier_extra_info?: string;
  has_connection_with_supplier_system: boolean;
  iban?: string;
  bic?: string;
  account_holder_name?: string;
  account_holder_city?: string;
  vat_number: string;
  kvk_number?: string;
  debtor_number?: string;
  payment_terms?: string;
  payment_instruction?: string;
  payment_method: any;
  order_method: any;
  delivery_time_of_order: any;
  minimum_order_amount: any;
  phone?: string;
  mobile_phone?: string;
  email?: string;
  email_extra?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  pinterest?: string;
  tiktok?: string;
  memo?: string;
}

export interface Brand {
  id?: number;
  name: string;
  description: string;
  logo: any;
}

export interface Category {
  id: number;
  name: string;
  parent_category?: number;
  sub_categories: SubCategory[];
  image: any;
  is_active: boolean;
  order: number;
}

export interface SubCategory {
  id: number;
  name: string;
  parent_category: number;
  sub_categories: Category[];
  image: any;
  is_active: boolean;
  order: number;
}
