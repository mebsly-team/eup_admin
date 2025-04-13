export type ICampaignItem = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  discount_percentage: string | number;
  start_date: string;
  end_date: string;
  images: string[];
  products: number[];
};


export type ICampaignTableFilterValue = string | string[];

export type ICampaignTableFilters = {
  name: string;
  role: string[];
  status: string;
};