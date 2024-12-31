import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ISupplierItem } from 'src/types/supplier';

import SupplierNewEditForm from '../supplier-new-edit-form';

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

  useEffect(() => {
    getSupplierInfo(id);
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
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentSupplier && <SupplierNewEditForm currentSupplier={currentSupplier} />}
    </Container>
  );
}
