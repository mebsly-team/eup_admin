import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// OVERVIEW
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce').catch(() => ({ default: () => <div>Error loading page</div> })));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics').catch(() => ({ default: () => <div>Error loading page</div> })));
// PRODUCT
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// Campaign
const CampaignListPage = lazy(() => import('src/pages/dashboard/campaign/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const CampaignCreatePage = lazy(() => import('src/pages/dashboard/campaign/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const CampaignEditPage = lazy(() => import('src/pages/dashboard/campaign/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// BRAND
const BrandListPage = lazy(() => import('src/pages/dashboard/brand/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const BrandCreatePage = lazy(() => import('src/pages/dashboard/brand/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const BrandEditPage = lazy(() => import('src/pages/dashboard/brand/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// LANGUAGE
const LanguageListPage = lazy(() => import('src/pages/dashboard/language/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const LanguageCreatePage = lazy(() => import('src/pages/dashboard/language/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const LanguageEditPage = lazy(() => import('src/pages/dashboard/language/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// CATEGORY
const CategoryListPage = lazy(() => import('src/pages/dashboard/category/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const CategoryCreatePage = lazy(() => import('src/pages/dashboard/category/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const CategoryEditPage = lazy(() => import('src/pages/dashboard/category/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// CATEGORY
const SupplierListPage = lazy(() => import('src/pages/dashboard/supplier/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const SupplierCreatePage = lazy(() => import('src/pages/dashboard/supplier/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const SupplierEditPage = lazy(() => import('src/pages/dashboard/supplier/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const OrderCreatePage = lazy(() => import('src/pages/dashboard/order/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details').catch(() => ({ default: () => <div>Error loading page</div> })));
// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details').catch(() => ({ default: () => <div>Error loading page</div> })));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile').catch(() => ({ default: () => <div>Error loading page</div> })));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards').catch(() => ({ default: () => <div>Error loading page</div> })));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account').catch(() => ({ default: () => <div>Error loading page</div> })));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// EMPLOYEE
const EmployeeProfilePage = lazy(() => import('src/pages/dashboard/employee/profile').catch(() => ({ default: () => <div>Error loading page</div> })));
const EmployeeCardsPage = lazy(() => import('src/pages/dashboard/employee/cards').catch(() => ({ default: () => <div>Error loading page</div> })));
const EmployeeListPage = lazy(() => import('src/pages/dashboard/employee/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const EmployeeAccountPage = lazy(() => import('src/pages/dashboard/employee/account').catch(() => ({ default: () => <div>Error loading page</div> })));
const EmployeeCreatePage = lazy(() => import('src/pages/dashboard/employee/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const EmployeeEditPage = lazy(() => import('src/pages/dashboard/employee/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// STATICS
const StaticsProfilePage = lazy(() => import('src/pages/dashboard/statics/profile').catch(() => ({ default: () => <div>Error loading page</div> })));
const StaticsCardsPage = lazy(() => import('src/pages/dashboard/statics/cards').catch(() => ({ default: () => <div>Error loading page</div> })));
const StaticsListPage = lazy(() => import('src/pages/dashboard/statics/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const StaticsAccountPage = lazy(() => import('src/pages/dashboard/statics/account').catch(() => ({ default: () => <div>Error loading page</div> })));
const StaticsCreatePage = lazy(() => import('src/pages/dashboard/statics/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const StaticsEditPage = lazy(() => import('src/pages/dashboard/statics/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// PURCHASE
const PurchaseProfilePage = lazy(() => import('src/pages/dashboard/purchase/profile').catch(() => ({ default: () => <div>Error loading page</div> })));
const PurchaseCardsPage = lazy(() => import('src/pages/dashboard/purchase/cards').catch(() => ({ default: () => <div>Error loading page</div> })));
const PurchaseListPage = lazy(() => import('src/pages/dashboard/purchase/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const PurchaseOffersPage = lazy(() => import('src/pages/dashboard/purchase/offers').catch(() => ({ default: () => <div>Error loading page</div> })));
const PurchaseCreatePage = lazy(() => import('src/pages/dashboard/purchase/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const PurchaseEditPage = lazy(() => import('src/pages/dashboard/purchase/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
const PurchaseOfferPage = lazy(() => import('src/pages/dashboard/purchase/offer').catch(() => ({ default: () => <div>Error loading page</div> })));
// LOGS
const LogsProfilePage = lazy(() => import('src/pages/dashboard/logs/profile').catch(() => ({ default: () => <div>Error loading page</div> })));
const LogsCardsPage = lazy(() => import('src/pages/dashboard/logs/cards').catch(() => ({ default: () => <div>Error loading page</div> })));
const LogsListPage = lazy(() => import('src/pages/dashboard/logs/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const LogsAccountPage = lazy(() => import('src/pages/dashboard/logs/account').catch(() => ({ default: () => <div>Error loading page</div> })));
const LogsCreatePage = lazy(() => import('src/pages/dashboard/logs/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const LogsEditPage = lazy(() => import('src/pages/dashboard/logs/edit').catch(() => ({ default: () => <div>Error loading page</div> })));
// MAP
const MapProfilePage = lazy(() => import('src/pages/dashboard/map/profile').catch(() => ({ default: () => <div>Error loading page</div> })));
const MapCardsPage = lazy(() => import('src/pages/dashboard/map/cards').catch(() => ({ default: () => <div>Error loading page</div> })));
const MapListPage = lazy(() => import('src/pages/dashboard/map/list').catch(() => ({ default: () => <div>Error loading page</div> })));
const MapAccountPage = lazy(() => import('src/pages/dashboard/map/account').catch(() => ({ default: () => <div>Error loading page</div> })));
const MapCreatePage = lazy(() => import('src/pages/dashboard/map/new').catch(() => ({ default: () => <div>Error loading page</div> })));
const MapEditPage = lazy(() => import('src/pages/dashboard/map/edit').catch(() => ({ default: () => <div>Error loading page</div> })));

// APP
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar').catch(() => ({ default: () => <div>Error loading page</div> })));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban').catch(() => ({ default: () => <div>Error loading page</div> })));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission').catch(() => ({ default: () => <div>Error loading page</div> })));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank').catch(() => ({ default: () => <div>Error loading page</div> })));

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
      // { element: <OverviewEcommercePage />, index: true },
      { element: <ProductListPage />, index: true },
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
        path: 'purchase',
        children: [
          { element: <PurchaseProfilePage />, index: true },
          { path: 'profile', element: <PurchaseProfilePage /> },
          { path: 'cards', element: <PurchaseCardsPage /> },
          { path: 'list', element: <PurchaseListPage /> },
          { path: 'new', element: <PurchaseCreatePage /> },
          { path: ':id/edit', element: <PurchaseEditPage /> },
          { path: 'offers', element: <PurchaseOffersPage /> },
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
        path: 'map',
        children: [
          { element: <MapProfilePage />, index: true },
          { path: 'profile', element: <MapProfilePage /> },
          { path: 'cards', element: <MapCardsPage /> },
          { path: 'list', element: <MapListPage /> },
          { path: 'new', element: <MapCreatePage /> },
          { path: ':id/edit', element: <MapEditPage /> },
          { path: 'account', element: <MapAccountPage /> },
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
          { path: 'new', element: <OrderCreatePage /> },
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
