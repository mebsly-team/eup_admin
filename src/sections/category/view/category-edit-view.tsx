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
    const { data } = await axiosInstance.get(`/categories/${categoryId}/?nocache=true`);
    setCurrentCategory(data);
  };
  const { t, onChangeLang } = useTranslate();

  useEffect(() => {
    // The form keeps its own state, so it must remount for another category.
    setCurrentCategory(undefined);
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
          mb: 3,
        }}
      />
      {currentCategory && (
        <CategoryNewEditForm key={currentCategory.id} currentCategory={currentCategory} />
      )}
    </Container>
  );
}
