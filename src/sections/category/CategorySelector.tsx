import { useState, useEffect } from 'react';

import { TreeView, TreeItem } from '@mui/x-tree-view';
import {
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress, // Add CircularProgress for the spinner
} from '@mui/material';

import { useGetCategories } from 'src/api/category';

export const CategorySelector = ({
  t,
  defaultSelectedCategories = [],
  open,
  onClose,
  onSave,
  single,
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  console.log('selectedCategories', selectedCategories);

  const cachedCategories = JSON.parse(localStorage.getItem('categories'));
  let categories = cachedCategories || [];

  const { items: categoriesNew } = useGetCategories();
  if (categoriesNew?.length) categories = categoriesNew;

  useEffect(() => {
    if (defaultSelectedCategories) {
      const selectedIds = defaultSelectedCategories.map((item) => item?.id).filter((item) => item);
      setSelectedCategories(selectedIds);
    }
  }, [defaultSelectedCategories]);

  const toggleCategory = (categoryId) => {
    if (single) {
      setSelectedCategories([categoryId]);
    } else if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const renderTree = (nodes) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id.toString()}
      label={nodes.name}
      onClick={() => toggleCategory(nodes.id)}
    >
      {Array.isArray(nodes.sub_categories)
        ? nodes.sub_categories.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  const handleSave = () => {
    const sc = flattenCategories(categories)?.filter((category) =>
      selectedCategories.includes(category.id)
    );
    onSave(single ? sc[0] : sc);
    onClose();
  };

  if (!categories?.length) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('select_category')}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 5 }}>
          <CircularProgress size={24} color="inherit" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('select_category')}</DialogTitle>
      <DialogContent>
        <TreeView selected={selectedCategories.map((id) => id.toString())}>
          {categories?.map((category) => renderTree(category))}
        </TreeView>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('cancel')}
        </Button>
        <Button onClick={handleSave} color="primary">
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function flattenCategories(categories = []) {
  let flattenedCategories = [];

  categories?.forEach((category) => {
    flattenedCategories.push(category);
    if (category.sub_categories && category.sub_categories.length > 0) {
      flattenedCategories = flattenedCategories.concat(flattenCategories(category.sub_categories));
    }
  });

  return flattenedCategories;
}
