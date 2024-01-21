export type IBrandItem = {
  id?: number;
  name: string;
  description: string;
  logo?: any;
  logo_id?: any;
  logo_url?: any;
};


export type IBrandTableFilterValue = string | string[];

export type IBrandTableFilters = {
  name: string;
  role: string[];
  status: string;
};