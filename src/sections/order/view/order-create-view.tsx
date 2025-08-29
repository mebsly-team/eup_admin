import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import OrderNewEditForm from '../order-new-edit-form';

export default function OrderCreateView() {
    const settings = useSettingsContext();
    const { t } = useTranslate();

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <CustomBreadcrumbs
                heading={t('create_order')}
                links={[
                    {
                        name: t('dashboard'),
                        href: paths.dashboard.root,
                    },
                    {
                        name: t('order'),
                        href: paths.dashboard.order.root,
                    },
                    { name: t('new_order') },
                ]}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <OrderNewEditForm />
        </Container>
    );
} 