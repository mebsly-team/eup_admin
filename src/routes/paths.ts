import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma:
    'https://www.figma.com/file/hjxMnGUJCjY7pX8lQbS7kn/%5BPreview%5D-Minimal-Web.v5.4.0?type=design&node-id=0-1&mode=design&t=2fxnS70DuiTLGzND-0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id: string) => `/product/${id}`,
    demo: {
      details: `/product/${MOCK_ID}`,
    },
  },
  post: {
    root: `/post`,
    details: (title: string) => `/post/${paramCase(title)}`,
    demo: {
      details: `/post/${paramCase(MOCK_TITLE)}`,
    },
  },
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    // root: ROOTS.DASHBOARD,
    root: `${ROOTS.DASHBOARD}/product`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      // file: `${ROOTS.DASHBOARD}/file`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    employee: {
      root: `${ROOTS.DASHBOARD}/employee`,
      new: `${ROOTS.DASHBOARD}/employee/new`,
      list: `${ROOTS.DASHBOARD}/employee/list`,
      cards: `${ROOTS.DASHBOARD}/employee/cards`,
      profile: `${ROOTS.DASHBOARD}/employee/profile`,
      account: `${ROOTS.DASHBOARD}/employee/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/employee/${id}/edit`,
    },
    statics: {
      root: `${ROOTS.DASHBOARD}/statics`,
      new: `${ROOTS.DASHBOARD}/statics/new`,
      list: `${ROOTS.DASHBOARD}/statics/list`,
      cards: `${ROOTS.DASHBOARD}/statics/cards`,
      profile: `${ROOTS.DASHBOARD}/statics/profile`,
      account: `${ROOTS.DASHBOARD}/statics/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/statics/${id}/edit`,
    },
    purchase: {
      root: `${ROOTS.DASHBOARD}/purchase`,
      new: `${ROOTS.DASHBOARD}/purchase/new`,
      list: `${ROOTS.DASHBOARD}/purchase/list`,
      cards: `${ROOTS.DASHBOARD}/purchase/cards`,
      profile: `${ROOTS.DASHBOARD}/purchase/profile`,
      offers: `${ROOTS.DASHBOARD}/purchase/offers`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/purchase/${id}/edit`,
    },
    logs: {
      root: `${ROOTS.DASHBOARD}/logs`,
      new: `${ROOTS.DASHBOARD}/logs/new`,
      list: `${ROOTS.DASHBOARD}/logs/list`,
      cards: `${ROOTS.DASHBOARD}/logs/cards`,
      profile: `${ROOTS.DASHBOARD}/logs/profile`,
      account: `${ROOTS.DASHBOARD}/logs/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/logs/${id}/edit`,
    },
    map: {
      root: `${ROOTS.DASHBOARD}/map`,
      new: `${ROOTS.DASHBOARD}/map/new`,
      list: `${ROOTS.DASHBOARD}/map/list`,
      cards: `${ROOTS.DASHBOARD}/map/cards`,
      profile: `${ROOTS.DASHBOARD}/map/profile`,
      account: `${ROOTS.DASHBOARD}/map/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/map/${id}/edit`,
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    campaign: {
      root: `${ROOTS.DASHBOARD}/campaign`,
      new: `${ROOTS.DASHBOARD}/campaign/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/campaign/${id}/edit`,
    },
    brand: {
      root: `${ROOTS.DASHBOARD}/brand`,
      new: `${ROOTS.DASHBOARD}/brand/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/brand/${id}/edit`,
    },
    language: {
      root: `${ROOTS.DASHBOARD}/language`,
      new: `${ROOTS.DASHBOARD}/language/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/language/${id}/edit`,
    },
    category: {
      root: `${ROOTS.DASHBOARD}/category`,
      new: `${ROOTS.DASHBOARD}/category/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/category/${id}/edit`,
    },
    supplier: {
      root: `${ROOTS.DASHBOARD}/supplier`,
      list: `${ROOTS.DASHBOARD}/supplier`,
      new: `${ROOTS.DASHBOARD}/supplier/new`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/supplier/${id}/edit`,
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      new: `${ROOTS.DASHBOARD}/order/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
  },
};
