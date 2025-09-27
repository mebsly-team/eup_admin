import { useState, useEffect } from 'react';

import { TreeView, TreeItem } from '@mui/x-tree-view';
import {
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Box,
} from '@mui/material';

import { useGetCategories } from 'src/api/category';
import { useTranslate } from 'src/locales';
import { Category, SubCategory } from 'src/types/product';

type CategoryNode = Category | SubCategory;

interface SimplifiedCategory {
  id: number;
  name: string;
  sub_categories?: SimplifiedCategory[];
}

interface CategorySelectorProps {
  defaultSelectedCategories?: SimplifiedCategory[];
  open: boolean;
  onClose: () => void;
  onSave: (categories: SimplifiedCategory | SimplifiedCategory[]) => void;
  single?: boolean;
}

export const CategorySelector = ({
  defaultSelectedCategories = [],
  open,
  onClose,
  onSave,
  single,
}: CategorySelectorProps) => {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  console.log('selectedCategories', selectedCategories);
  const { t, onChangeLang } = useTranslate();

  const cachedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
  let categories: SimplifiedCategory[] = cachedCategories || [];

  const { items: categoriesNew } = useGetCategories();
  if (categoriesNew?.length) {
    const mapCategory = (item: any): SimplifiedCategory => ({
      id: item.id || 0,
      name: item.name,
      sub_categories: item.sub_categories ? item.sub_categories.map(mapCategory) : []
    });
    categories = categoriesNew.map(mapCategory);
  }

  useEffect(() => {
    if (defaultSelectedCategories.length) {
      const selectedIds = defaultSelectedCategories.map((item) => item?.id).filter((item) => item);
      setSelectedCategories(selectedIds);
    }
  }, [defaultSelectedCategories]);

  const findParentCategories = (categoryId: number, categories: SimplifiedCategory[]): number[] => {
    const parentIds: number[] = [];

    const findParent = (cats: SimplifiedCategory[], targetId: number): SimplifiedCategory | null => {
      for (const cat of cats) {
        if (cat.sub_categories?.some(sub => sub.id === targetId)) {
          return cat;
        }
        if (cat.sub_categories) {
          const found = findParent(cat.sub_categories, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    let currentId = categoryId;
    while (true) {
      const parent = findParent(categories, currentId);
      if (!parent) break;
      parentIds.unshift(parent.id);
      currentId = parent.id;
    }

    return parentIds;
  };

  const getAllChildCategories = (categoryId: number, categories: SimplifiedCategory[]): number[] => {
    const childIds: number[] = [];

    const findCategory = (cats: SimplifiedCategory[], targetId: number): SimplifiedCategory | null => {
      for (const cat of cats) {
        if (cat.id === targetId) return cat;
        if (cat.sub_categories) {
          const found = findCategory(cat.sub_categories, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const collectChildren = (category: SimplifiedCategory) => {
      if (category.sub_categories) {
        category.sub_categories.forEach(child => {
          childIds.push(child.id);
          collectChildren(child);
        });
      }
    };

    const category = findCategory(categories, categoryId);
    if (category) {
      collectChildren(category);
    }

    return childIds;
  };

  const toggleCategory = (categoryId: number) => {
    if (single) {
      setSelectedCategories([categoryId]);
      return;
    }

    const isCurrentlySelected = selectedCategories.includes(categoryId);

    if (isCurrentlySelected) {
      // Deselecting: remove this category and all its children
      const childIds = getAllChildCategories(categoryId, categories);
      const idsToRemove = [categoryId, ...childIds];
      setSelectedCategories(selectedCategories.filter(id => !idsToRemove.includes(id)));
    } else {
      // Selecting: add this category and all its parent categories
      const parentIds = findParentCategories(categoryId, categories);
      const idsToAdd = [...parentIds, categoryId];
      const newSelected = [...selectedCategories];

      idsToAdd.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });

      setSelectedCategories(newSelected);
    }
  };

  const renderTree = (nodes: SimplifiedCategory) => {
    const isSelected = selectedCategories.includes(nodes.id);

    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.id.toString()}
        label={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.5,
              backgroundColor: isSelected ? 'primary.lighter' : 'transparent',
              borderRadius: 1,
              px: 1,
              border: isSelected ? '2px solid' : '1px solid transparent',
              borderColor: isSelected ? 'primary.main' : 'transparent',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleCategory(nodes.id);
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                />
              }
              label={nodes.name}
              sx={{
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'primary.main' : 'text.primary',
                }
              }}
            />
          </Box>
        }
      >
        {Array.isArray(nodes.sub_categories)
          ? nodes.sub_categories.map((node) => renderTree(node))
          : null}
      </TreeItem>
    );
  };

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
        <TreeView
          defaultCollapseIcon={<span>▼</span>}
          defaultExpandIcon={<span>▶</span>}
          sx={{
            '& .MuiTreeItem-content': {
              padding: 0,
            },
            '& .MuiTreeItem-label': {
              padding: 0,
            },
          }}
        >
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

function flattenCategories(categories: SimplifiedCategory[] = []): SimplifiedCategory[] {
  let flattenedCategories: SimplifiedCategory[] = [];

  categories?.forEach((category) => {
    flattenedCategories.push(category);
    if (category.sub_categories && category.sub_categories.length > 0) {
      flattenedCategories = flattenedCategories.concat(flattenCategories(category.sub_categories));
    }
  });

  return flattenedCategories;
}
