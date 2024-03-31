export type ICampaignItem = {
  extension: any;
  id?: number;
  name: string;
  description: string;
  logo?: any;
  logo_id?: any;
  logo_url?: any;
};


export type ICampaignTableFilterValue = string | string[];

export type ICampaignTableFilters = {
  name: string;
  role: string[];
  status: string;
};