import { useState, Fragment, useEffect } from 'react';
import {
    List, Dialog,
    Button, ListItem,
    Checkbox,
    DialogTitle,
    ListItemText,
    ListItemIcon,
    DialogContent,
    DialogActions
} from '@mui/material';

export const CategorySelector = ({ t, categories, defaultSelectedCategories, open, onClose, onSave, single }) => {

    const [selectedCategories, setSelectedCategories] = useState([]);


    const toggleCategory = (categoryId) => {
        if (single) {
            setSelectedCategories([categoryId]);
        }
        else if (selectedCategories.includes(categoryId)) {
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
    const renderOptions = (categories, level = 0) => categories.map((category) => (
        <Fragment key={category.id}>
            <ListItem dense button onClick={() => toggleCategory(category.id)}>
                <ListItemIcon>
                    <Checkbox
                        edge="start"
                        checked={selectedCategories.includes(category.id)}
                        tabIndex={-1}
                        disableRipple />
                </ListItemIcon>
                <ListItemText primary={category.name} />
            </ListItem>
            {category.sub_categories.length > 0 && (
                <List style={{ paddingLeft: `${(level + 1) * 20}px` }}>
                    {renderOptions(category.sub_categories, level + 1)}
                </List>
            )}
        </Fragment>
    ));

    const handleSave = () => {
        onSave(single ? selectedCategories[0] : selectedCategories);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('select_category')}</DialogTitle>
            <DialogContent>
                <List>{renderOptions(categories)}</List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSave} color="primary">
                    {t('save')}
                </Button>
                <Button onClick={onClose} color="primary">
                    {t('cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
