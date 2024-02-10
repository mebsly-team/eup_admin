import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { ICategoryItem } from 'src/types/category';

import CategoryNewEditForm from '../category-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export default function CategoryEditView({ id }: Props) {
  const settings = useSettingsContext();
  const [currentCategory, setCurrentCategory] = useState<ICategoryItem>();
  const getCategoryInfo = async (categoryId: string) => {
    const { data } = await axiosInstance.get(`/categories/${categoryId}/`);
    setCurrentCategory(data);
  };
  const { t, onChangeLang } = useTranslate();

  useEffect(() => {
    getCategoryInfo(id);
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
            name: t('category'),
            href: paths.dashboard.category.root,
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
