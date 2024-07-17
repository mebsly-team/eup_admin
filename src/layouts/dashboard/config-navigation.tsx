import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [
          {
            title: t('app'),
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
          // {
          //   title: t('analytics'),
          //   path: paths.dashboard.general.analytics,
          //   icon: ICONS.analytics,
          // },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // PRODUCT
          {
            title: t('product'),
            path: paths.dashboard.product.root,
            icon: ICONS.product,
            children: [
              { title: t('list'), path: paths.dashboard.product.root },
              // {
              //   title: t('details'),
              //   path: paths.dashboard.product.demo.details,
              // },
              { title: t('create'), path: paths.dashboard.product.new },
              // { title: t('edit'), path: paths.dashboard.product.demo.edit },
            ],
          },
          // Campaign
          {
            title: t('acties'),
            path: paths.dashboard.campaign.root,
            icon: ICONS.order,
            children: [
              { title: t('list'), path: paths.dashboard.campaign.root },
              { title: t('create'), path: paths.dashboard.campaign.new },
            ],
          },
          // Brand
          {
            title: t('brand'),
            path: paths.dashboard.brand.root,
            icon: ICONS.order,
            children: [
              { title: t('list'), path: paths.dashboard.brand.root },
              { title: t('create'), path: paths.dashboard.brand.new },
            ],
          },
          // Category
          {
            title: t('category'),
            path: paths.dashboard.category.root,
            icon: ICONS.order,
            children: [
              { title: t('list'), path: paths.dashboard.category.root },
              { title: t('create'), path: paths.dashboard.category.new },
            ],
          },
          // Supplier
          {
            title: t('supplier'),
            path: paths.dashboard.supplier.list,
            icon: ICONS.order,
            children: [
              { title: t('list'), path: paths.dashboard.supplier.list },
              { title: t('create'), path: paths.dashboard.supplier.new },
            ],
          },
          // USER
          {
            title: t('user'),
            path: paths.dashboard.user.list,
            icon: ICONS.user,
            children: [
              // { title: t('profile'), path: paths.dashboard.user.root },
              // { title: t('cards'), path: paths.dashboard.user.cards },
              { title: t('list'), path: paths.dashboard.user.list },
              { title: t('create'), path: paths.dashboard.user.new },
              // { title: t('edit'), path: paths.dashboard.user.demo.edit },
              // { title: t('account'), path: paths.dashboard.user.account },
            ],
          },
          // EMPLOYEE
          {
            title: t('employee'),
            path: paths.dashboard.employee.list,
            icon: ICONS.user,
            children: [
              // { title: t('profile'), path: paths.dashboard.employee.root },
              // { title: t('cards'), path: paths.dashboard.employee.cards },
              { title: t('list'), path: paths.dashboard.employee.list },
              { title: t('create'), path: paths.dashboard.employee.new },
              // { title: t('edit'), path: paths.dashboard.employee.demo.edit },
              // { title: t('account'), path: paths.dashboard.employee.account },
            ],
          },
          // STATICS
          {
            title: t('statics'),
            path: paths.dashboard.statics.list,
            icon: ICONS.user,
            children: [
              // { title: t('profile'), path: paths.dashboard.statics.root },
              // { title: t('cards'), path: paths.dashboard.statics.cards },
              { title: t('list'), path: paths.dashboard.statics.list },
              // { title: t('create'), path: paths.dashboard.statics.new },
              // { title: t('edit'), path: paths.dashboard.statics.demo.edit },
              // { title: t('account'), path: paths.dashboard.statics.account },
            ],
          },
          // LOGS
          {
            title: t('logs'),
            path: paths.dashboard.logs.list,
            icon: ICONS.user,
            children: [
              // { title: t('profile'), path: paths.dashboard.logs.root },
              // { title: t('cards'), path: paths.dashboard.logs.cards },
              { title: t('list'), path: paths.dashboard.logs.list },
              // { title: t('create'), path: paths.dashboard.logs.new },
              // { title: t('edit'), path: paths.dashboard.logs.demo.edit },
              // { title: t('account'), path: paths.dashboard.logs.account },
            ],
          },
          // MAP
          {
            title: t('map'),
            path: paths.dashboard.map.list,
            icon: ICONS.user,
            children: [
              // { title: t('profile'), path: paths.dashboard.map.root },
              // { title: t('cards'), path: paths.dashboard.map.cards },
              { title: t('list'), path: paths.dashboard.map.list },
              // { title: t('create'), path: paths.dashboard.map.new },
              // { title: t('edit'), path: paths.dashboard.map.demo.edit },
              // { title: t('account'), path: paths.dashboard.map.account },
            ],
          },
          // ORDER
          {
            title: t('order'),
            path: paths.dashboard.order.root,
            icon: ICONS.order,
            children: [
              { title: t('list'), path: paths.dashboard.order.root },
              { title: t('details'), path: paths.dashboard.order.demo.details },
            ],
          },

          // INVOICE
          // {
          //   title: t('invoice'),
          //   path: paths.dashboard.invoice.root,
          //   icon: ICONS.invoice,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.invoice.root },
          //     {
          //       title: t('details'),
          //       path: paths.dashboard.invoice.demo.details,
          //     },
          //     { title: t('create'), path: paths.dashboard.invoice.new },
          //     { title: t('edit'), path: paths.dashboard.invoice.demo.edit },
          //   ],
          // },

          // // LANGUAGE
          // {
          //   title: t('language'),
          //   path: paths.dashboard.language.root,
          //   icon: ICONS.order,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.language.root },
          //     { title: t('create'), path: paths.dashboard.language.new },
          //   ],
          // },

          // CALENDAR
          {
            title: t('calendar'),
            path: paths.dashboard.calendar,
            icon: ICONS.calendar,
          },

          // KANBAN
          {
            title: t('kanban'),
            path: paths.dashboard.kanban,
            icon: ICONS.kanban,
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
