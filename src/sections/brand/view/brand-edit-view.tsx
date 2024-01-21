import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { IBrandItem } from 'src/types/brand';

import BrandNewEditForm from '../brand-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function BrandEditView({ id }: Props) {
  const settings = useSettingsContext();
  const [currentBrand, setCurrentBrand] = useState<IBrandItem>();
  const getBrandInfo = async (brandId: string) => {
    const { data } = await axiosInstance.get(`/brands/${brandId}/`);
    setCurrentBrand(data);
  };

  useEffect(() => {
    getBrandInfo(id);
  }, [id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Brand',
            href: paths.dashboard.brand.root,
          },
          { name: currentBrand?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentBrand && <BrandNewEditForm currentBrand={currentBrand} />}
    </Container>
  );
}
