import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import CategoryNewEditForm from '../category-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function CategoryEditView({ id }: Props) {
  const settings = useSettingsContext();
  const [currentCategory, setCurrentCategory] = useState<any>();
  const getBrandInfo = async (brandId: string) => {
    const { data } = await axiosInstance.get(`/brand/${brandId}/`);
    setCurrentCategory(data);
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
            name: 'Category',
            href: paths.dashboard.brand.root,
          },
          { name: currentCategory?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentCategory && <CategoryNewEditForm currentCategory={currentCategory} />}
    </Container>
  );
}
