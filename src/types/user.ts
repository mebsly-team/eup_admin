import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type IUserTableFilterValue = string | string[];

export type IUserTableFilters = {
  name: string;
  role: string[];
  status: string;
};

// ----------------------------------------------------------------------

export type IUserSocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type IUserProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IUserProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: IUserSocialLink;
};

export type IUserProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IUserProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: Date;
};

export type IUserProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IUserProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: Date;
  personLikes: {
    name: string;
    avatarUrl: string;
  }[];
  comments: {
    id: string;
    message: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  }[];
};

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserItem = {
  id: number
  address_list: any[]
  last_login: any
  is_superuser: boolean
  email: string
  first_name: string
  last_name: string
  gender: any
  birthdate: any
  phone_number: string
  mobile_number: any
  type: string
  is_active: boolean
  is_staff: boolean
  business_name: any
  contact_person_name: any
  contact_person_phone_number: any
  is_eligible_to_work_with: boolean
  department: any
  classification: any
  branch: any
  inform_when_new_products: boolean
  inform_via: any
  invoice_language: any
  iban: any
  bic: any
  account_holder_name: any
  account_holder_city: any
  vat: any
  kvk: any
  payment_method: any
  customer_percentage: any
  invoice_discount: any
  payment_termin: any
  is_payment_termin_active: boolean
  credit_limit: any
  incasseren: boolean
  invoice_address: any
  discount_group: any
  customer_color: any
  relation_type: any
  relation_via: any
  notify: boolean
  days_closed: any
  days_no_delivery: any
  phone: any
  mobile_phone: any
  fax: any
  contact_person_email: any
  website: any
  is_subscribed_newsletters: boolean
  is_access_granted_social_media: boolean
  facebook: any
  linkedin: any
  twitter: any
  instagram: any
  pinterest: any
  tiktok: any
  notes: any
  last_transaction_date: any
  groups: any[]
  user_permissions: any[]
};

export type IProfileItem = {
  id: number
  last_login: any
  is_superuser: boolean
  first_name: string
  last_name: string
  gender: any
  birthdate: any
  phone_number: string
  mobile_number: any
  facebook: any
  linkedin: any
  twitter: any
  instagram: any
  pinterest: any
  tiktok: any
};

export type IUserAccount = {
  email: string;
  isPublic: boolean;
  displayName: string;
  city: string | null;
  state: string | null;
  about: string | null;
  country: string | null;
  address: string | null;
  zipCode: string | null;
  phoneNumber: string | null;
  photoURL: CustomFile | string | null;
};

export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  createdAt: Date;
  invoiceNumber: string;
};

export type IUserAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
