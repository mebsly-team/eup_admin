export const findCategory = (categories, categoryId) => {
    for (const category of categories) {
        if (category.id === categoryId) {
            return category;
        }
        if (category.sub_categories.length > 0) {
            const foundSubCategory = findCategory(category.sub_categories, categoryId);
            if (foundSubCategory) {
                return foundSubCategory;
            }
        }
    }
    return null;
};
