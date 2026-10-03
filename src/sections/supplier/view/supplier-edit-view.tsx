import { useState, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ISupplierItem } from 'src/types/supplier';

import SupplierNewEditForm from '../supplier-new-edit-form';
import SupplierProductsTable from '../../product-supplier/supplier-products-table';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function SupplierEditView({ id }: Props) {
  const settings = useSettingsContext();
  const [currentSupplier, setSupplierBrand] = useState<ISupplierItem>();
  const getSupplierInfo = async (supplierId: string) => {
    const { data } = await axiosInstance.get(`/suppliers/${supplierId}/?nocache=true`);
    setSupplierBrand(data);
  };
  const { t, onChangeLang } = useTranslate();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'producten' ? 'producten' : 'gegevens';
  const [productCount, setProductCount] = useState<number | null>(null);

  const handleTab = (event: React.SyntheticEvent, value: string) => {
    router.replace(
      `${paths.dashboard.supplier.edit(id)}${value === 'producten' ? '?tab=producten' : ''}`
    );
  };

  useEffect(() => {
    getSupplierInfo(id);
    axiosInstance
      .get(`/product-suppliers/?supplier=${id}&limit=1`)
      .then(({ data }) => setProductCount(data?.count ?? null))
      .catch(() => setProductCount(null));
  }, [id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('edit')}
        links={[
          {
            name: t('dashboard'),
            href: paths.dashboard.root,
          },
          {
            name: t('supplier'),
            href: paths.dashboard.supplier.root,
          },
          { name: currentSupplier?.name },
        ]}
        sx={{
          mb: { xs: 2, md: 3 },
        }}
      />
      <Tabs value={tab} onChange={handleTab} sx={{ mb: { xs: 2, md: 3 } }}>
        <Tab value="gegevens" label="Gegevens" />
        <Tab
          value="producten"
          label={`Producten${productCount !== null ? ` (${productCount})` : ''}`}
        />
      </Tabs>
      {tab === 'gegevens' && currentSupplier && (
        <SupplierNewEditForm currentSupplier={currentSupplier} />
      )}
      {tab === 'producten' && (
        <SupplierProductsTable
          supplierId={Number(id)}
          supplierName={currentSupplier?.name}
          onCountChange={setProductCount}
        />
      )}
    </Container>
  );
}
