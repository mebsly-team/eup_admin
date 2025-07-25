export type ISupplierItem = {
  id: string;
  supplier_code: string;
  name: string;
  owner_fullname?: string;
  owner_birthday?: string;
  email?: string;
  email_extra?: string;
  phone: any;
  mobile_phone: any;
  fax?: string;
  gender: any;
  supplier_address_line1?: string;
  supplier_street_name?: string;
  supplier_house_number?: string;
  supplier_house_suffix?: string;
  supplier_state?: string;
  supplier_zip_code?: string;
  supplier_city?: string;
  supplier_country?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  contact_person_branch?: string;
  contact_person_department?: string;
  contact_person_country?: string;
  contact_person_nationality?: string;
  classification?: string;
  bank_account_number?: string;
  iban: any;
  bic: any;
  account_holder_name: any;
  account_holder_city: any;
  vat_number: string;
  kvk_number: any;
  debtor_number: any;
  payment_terms: any;
  payment_instruction: any;
  payment_method: any;
  order_method?: string;
  delivery_time_of_order?: string;
  minimum_order_amount: any;
  percentage_to_add?: string;
  invoice_discount?: string;
  closed_days?: string[];
  facebook: any;
  twitter: any;
  linkedin: any;
  instagram: any;
  pinterest: any;
  tiktok: any;
  website: any;
  memo: any;
  supplier_extra_info?: string;
  is_active?: boolean;
  hasGivenPaymentAuth?: boolean;
  has_connection_with_supplier_system?: boolean;
  recommended_product_offer?: Array<{ id: string; quantity: number }>;
  contact_person: any;
  address: any;
  postal_code: any;
  city: any;
  country: any;
  email_general: any;
};
