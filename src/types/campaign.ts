export type ICampaignStatus = 'active' | 'scheduled' | 'expired' | 'off';

export type ICampaignItem = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  // Banner label only; product prices are not changed by a campaign.
  discount_percentage: string | number | null;
  start_date: string;
  // null = no end: runs until it is switched off.
  end_date: string | null;
  images: string[];
  products: number[];
  product_count: number;
  sort_order: number;
  status: ICampaignStatus;
};

export type ICampaignStatusCounts = {
  total: number;
  counts: Partial<Record<ICampaignStatus, number>>;
};
