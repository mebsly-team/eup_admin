import { useState, Fragment, useEffect } from 'react';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import {
  List,
  Dialog,
  Button,
  ListItem,
  Checkbox,
  DialogTitle,
  ListItemText,
  ListItemIcon,
  DialogContent,
  DialogActions,
} from '@mui/material';

export const CategorySelector = ({
  t,
  categories,
  defaultSelectedCategories,
  open,
  onClose,
  onSave,
  single,
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (categoryId) => {
    if (single) {
      setSelectedCategories([categoryId]);
    } else if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
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
      onClick={() => toggleCategory(nodes.id)}
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

