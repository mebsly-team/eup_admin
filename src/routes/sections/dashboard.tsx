import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// OVERVIEW
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
// PRODUCT
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// Campaign
const CampaignListPage = lazy(() => import('src/pages/dashboard/campaign/list'));
const CampaignCreatePage = lazy(() => import('src/pages/dashboard/campaign/new'));
const CampaignEditPage = lazy(() => import('src/pages/dashboard/campaign/edit'));
// BRAND
const BrandListPage = lazy(() => import('src/pages/dashboard/brand/list'));
const BrandCreatePage = lazy(() => import('src/pages/dashboard/brand/new'));
const BrandEditPage = lazy(() => import('src/pages/dashboard/brand/edit'));
// LANGUAGE
const LanguageListPage = lazy(() => import('src/pages/dashboard/language/list'));
const LanguageCreatePage = lazy(() => import('src/pages/dashboard/language/new'));
const LanguageEditPage = lazy(() => import('src/pages/dashboard/language/edit'));
// CATEGORY
const CategoryListPage = lazy(() => import('src/pages/dashboard/category/list'));
const CategoryCreatePage = lazy(() => import('src/pages/dashboard/category/new'));
const CategoryEditPage = lazy(() => import('src/pages/dashboard/category/edit'));
// CATEGORY
const SupplierListPage = lazy(() => import('src/pages/dashboard/supplier/list'));
const SupplierCreatePage = lazy(() => import('src/pages/dashboard/supplier/new'));
const SupplierEditPage = lazy(() => import('src/pages/dashboard/supplier/edit'));
// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// EMPLOYEE
const EmployeeProfilePage = lazy(() => import('src/pages/dashboard/employee/profile'));
const EmployeeCardsPage = lazy(() => import('src/pages/dashboard/employee/cards'));
const EmployeeListPage = lazy(() => import('src/pages/dashboard/employee/list'));
const EmployeeAccountPage = lazy(() => import('src/pages/dashboard/employee/account'));
const EmployeeCreatePage = lazy(() => import('src/pages/dashboard/employee/new'));
const EmployeeEditPage = lazy(() => import('src/pages/dashboard/employee/edit'));
// STATICS
const StaticsProfilePage = lazy(() => import('src/pages/dashboard/statics/profile'));
const StaticsCardsPage = lazy(() => import('src/pages/dashboard/statics/cards'));
const StaticsListPage = lazy(() => import('src/pages/dashboard/statics/list'));
const StaticsAccountPage = lazy(() => import('src/pages/dashboard/statics/account'));
const StaticsCreatePage = lazy(() => import('src/pages/dashboard/statics/new'));
const StaticsEditPage = lazy(() => import('src/pages/dashboard/statics/edit'));
// LOGS
const LogsProfilePage = lazy(() => import('src/pages/dashboard/logs/profile'));
const LogsCardsPage = lazy(() => import('src/pages/dashboard/logs/cards'));
const LogsListPage = lazy(() => import('src/pages/dashboard/logs/list'));
const LogsAccountPage = lazy(() => import('src/pages/dashboard/logs/account'));
const LogsCreatePage = lazy(() => import('src/pages/dashboard/logs/new'));
const LogsEditPage = lazy(() => import('src/pages/dashboard/logs/edit'));

// APP
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <OverviewEcommercePage />, index: true },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      {
        path: 'user',
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'employee',
        children: [
          { element: <EmployeeProfilePage />, index: true },
          { path: 'profile', element: <EmployeeProfilePage /> },
          { path: 'cards', element: <EmployeeCardsPage /> },
          { path: 'list', element: <EmployeeListPage /> },
          { path: 'new', element: <EmployeeCreatePage /> },
          { path: ':id/edit', element: <EmployeeEditPage /> },
          { path: 'account', element: <EmployeeAccountPage /> },
        ],
      },
      {
        path: 'statics',
        children: [
          { element: <StaticsProfilePage />, index: true },
          { path: 'profile', element: <StaticsProfilePage /> },
          { path: 'cards', element: <StaticsCardsPage /> },
          { path: 'list', element: <StaticsListPage /> },
          { path: 'new', element: <StaticsCreatePage /> },
          { path: ':id/edit', element: <StaticsEditPage /> },
          { path: 'account', element: <StaticsAccountPage /> },
        ],
      },
      {
        path: 'logs',
        children: [
          { element: <LogsProfilePage />, index: true },
          { path: 'profile', element: <LogsProfilePage /> },
          { path: 'cards', element: <LogsCardsPage /> },
          { path: 'list', element: <LogsListPage /> },
          { path: 'new', element: <LogsCreatePage /> },
          { path: ':id/edit', element: <LogsEditPage /> },
          { path: 'account', element: <LogsAccountPage /> },
        ],
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'category',
        children: [
          { element: <CategoryListPage />, index: true },
          { path: 'list', element: <CategoryListPage /> },
          { path: 'new', element: <CategoryCreatePage /> },
          { path: ':id/edit', element: <CategoryEditPage /> },
        ],
      },
      {
        path: 'campaign',
        children: [
          { element: <CampaignListPage />, index: true },
          { path: 'list', element: <CampaignListPage /> },
          { path: 'new', element: <CampaignCreatePage /> },
          { path: ':id/edit', element: <CampaignEditPage /> },
        ],
      },
      {
        path: 'brand',
        children: [
          { element: <BrandListPage />, index: true },
          { path: 'list', element: <BrandListPage /> },
          { path: 'new', element: <BrandCreatePage /> },
          { path: ':id/edit', element: <BrandEditPage /> },
        ],
      },
      {
        path: 'supplier',
        children: [
          { element: <SupplierListPage />, index: true },
          { path: 'list', element: <SupplierListPage /> },
          { path: 'new', element: <SupplierCreatePage /> },
          { path: ':id/edit', element: <SupplierEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'language',
        children: [
          { element: <LanguageListPage />, index: true },
          { path: 'list', element: <LanguageListPage /> },
          { path: 'new', element: <LanguageCreatePage /> },
          { path: ':id/edit', element: <LanguageEditPage /> },
        ],
      },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
