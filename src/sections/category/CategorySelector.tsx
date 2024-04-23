import { useState, useEffect } from 'react';

import { TreeView, TreeItem } from '@mui/x-tree-view';
import { Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { useGetCategories } from 'src/api/category';

export const CategorySelector = ({
  t,
  defaultSelectedCategories,
  open,
  onClose,
  onSave,
  single,
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { items: categories } = useGetCategories();

  const toggleCategory = (category: { id: any; }) => {
    if (single) {
      setSelectedCategories([category]);
    } else if (selectedCategories.find((item) => item.id === category.id)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== category.id));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  useEffect(() => {
    if (defaultSelectedCategories) {
      setSelectedCategories(defaultSelectedCategories);
    }
  }, [defaultSelectedCategories]);

  const renderTree = (nodes) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id.toString()}
      label={nodes.name}
      onClick={() => toggleCategory(nodes)}
    >
      {Array.isArray(nodes.sub_categories)
        ? nodes.sub_categories.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  const handleSave = () => {
    onSave(single ? selectedCategories[0] : selectedCategories);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('select_category')}</DialogTitle>
      <DialogContent>
        <TreeView selected={selectedCategories}>
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
