import { useState, useEffect } from 'react';

import { TreeView, TreeItem } from '@mui/x-tree-view';
import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

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

  const { items: categories } = useGetCategories();

  useEffect(() => {
    if (defaultSelectedCategories) {
      const selectedIds = defaultSelectedCategories.map((item) => item.id);
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
    const sc = flattenCategories(categories).filter((category) =>
      selectedCategories.includes(category.id)
    );
    onSave(single ? sc[0] : sc);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('select_category')}</DialogTitle>
      <DialogContent>
        <TreeView selected={selectedCategories.map((id) => id.toString())}>
          {categories.map((category) => renderTree(category))}
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

function flattenCategories(categories) {
  let flattenedCategories = [];

  categories.forEach((category) => {
    flattenedCategories.push(category);
    if (category.sub_categories && category.sub_categories.length > 0) {
      flattenedCategories = flattenedCategories.concat(flattenCategories(category.sub_categories));
    }
  });

  return flattenedCategories;
}

const findCategoryById = (categories, id) => {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id === id) {
      return categories[i];
    }
    if (categories[i].sub_categories && categories[i].sub_categories.length > 0) {
      const found = findCategoryById(categories[i].sub_categories, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};