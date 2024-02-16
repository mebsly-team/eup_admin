import merge from 'lodash/merge';
// date fns
import {
  tr as trTRAdapter,
  nl as nlNLAdapter,
  enUS as enUSAdapter,
} from 'date-fns/locale';

// date pickers (MUI)
import {
  enUS as enUSDate,
  nlNL as nlNLDate,
  trTR as trTRDate,
  // frFR as frFRDate,
  // viVN as viVNDate,
  // zhCN as zhCNDate,
} from '@mui/x-date-pickers/locales';
// core (MUI)
import {
  enUS as enUSCore,
  nlNL as nlNLCore,
  trTR as trTRCore,
  // frFR as frFRCore,
  // viVN as viVNCore,
  // zhCN as zhCNCore,
  // arSA as arSACore,
} from '@mui/material/locale';
// data grid (MUI)
import {
  enUS as enUSDataGrid,
  trTR as trTRDataGrid,
  nlNL as nlNLDataGrid,
  // frFR as frFRDataGrid,
  // viVN as viVNDataGrid,
  // zhCN as zhCNDataGrid,
  // arSD as arSDDataGrid,
} from '@mui/x-data-grid';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'Nederland',
    value: 'nl',
    systemValue: merge(nlNLDate, nlNLDataGrid, nlNLCore),
    adapterLocale: nlNLAdapter,
    icon: 'flagpack:nl',
    numberFormat: {
      code: 'nl-Nl',
      currency: 'EUR',
    },
  },
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:gb-nir',
    numberFormat: {
      code: 'en-US',
      currency: 'EUR',
    },
  },
  {
    label: 'Turkce',
    value: 'tr',
    systemValue: merge(trTRDate, trTRDataGrid, trTRCore),
    adapterLocale: trTRAdapter,
    icon: 'flagpack:tr',
    numberFormat: {
      code: 'tr-Tr',
      currency: 'EUR',
    },
  },
  /* {
    label: 'Vietnamese',
    value: 'vi',
    systemValue: merge(viVNDate, viVNDataGrid, viVNCore),
    adapterLocale: viVNAdapter,
    icon: 'flagpack:vn',
    numberFormat: {
      code: 'vi-VN',
      currency: 'VND',
    },
  },
  {
    label: 'Chinese',
    value: 'cn',
    systemValue: merge(zhCNDate, zhCNDataGrid, zhCNCore),
    adapterLocale: zhCNAdapter,
    icon: 'flagpack:cn',
    numberFormat: {
      code: 'zh-CN',
      currency: 'CNY',
    },
  },
  {
    label: 'Arabic',
    value: 'ar',
    systemValue: merge(arSDDataGrid, arSACore),
    adapterLocale: arSAAdapter,
    icon: 'flagpack:sa',
    numberFormat: {
      code: 'ar',
      currency: 'AED',
    },
  }, */
];

export const defaultLang = allLangs[0]; // English

// GET MORE COUNTRY FLAGS
// https://icon-sets.iconify.design/flagpack/
// https://www.dropbox.com/sh/nec1vwswr9lqbh9/AAB9ufC8iccxvtWi3rzZvndLa?dl=0
