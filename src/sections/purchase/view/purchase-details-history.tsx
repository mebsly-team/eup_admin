import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';

import { useTranslate } from 'src/locales';
import { fDateTime } from 'src/utils/format-time';

type PurchaseHistory = {
    id: string;
    action: string;
    changes: Record<string, any>;
    created_at: string;
    user: string;
};

type PurchaseDetailsHistoryProps = {
    history: PurchaseHistory[];
};

export default function PurchaseDetailsHistory({ history }: PurchaseDetailsHistoryProps) {
    const { t } = useTranslate();

    const formatDate = (date: string) => {
        return fDateTime(new Date(date));
    };

    const renderChanges = (changes: Record<string, any>) => {
        const formattedChanges: string[] = [];

        Object.entries(changes).forEach(([key, value]) => {
            if (key === 'items') {
                const items = value as Array<any>;
                items.forEach((item, index) => {
                    if (item.quantity) {
                        formattedChanges.push(`${t('quantity')} #${index + 1}: ${item.quantity}`);
                    }
                    if (item.price) {
                        formattedChanges.push(`${t('price')} #${index + 1}: €${item.price}`);
                    }
                    if (item.vat_rate) {
                        formattedChanges.push(`${t('vat_rate')} #${index + 1}: ${item.vat_rate}%`);
                    }
                });
            } else if (key === 'supplier') {
                formattedChanges.push(`${t('supplier')}: ${value ? t('changed') : t('unchanged')}`);
            } else if (key === 'purchase_invoice_date') {
                formattedChanges.push(`${t('purchase_invoice_date')}: ${formatDate(value)}`);
            } else {
                formattedChanges.push(`${key}: ${value}`);
            }
        });

        return formattedChanges.map((change, index) => (
            <Typography key={index} variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                • {change}
            </Typography>
        ));
    };

    if (!history?.length) {
        return null;
    }

    return (
        <Card>
            <CardHeader title={t('history')} />

            <Stack spacing={3} sx={{ p: 3 }}>
                <Timeline>
                    {history.map((item) => (
                        <TimelineItem key={item.id}>
                            <TimelineSeparator>
                                <TimelineDot color="primary" />
                                <TimelineConnector />
                            </TimelineSeparator>

                            <TimelineContent>
                                <Typography variant="subtitle2">{t(item.action)}</Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {new Date(item.created_at).toLocaleString('nl-NL')}
                                </Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                    {t('by')} {item.user}
                                </Typography>

                                <Stack spacing={1}>
                                    {renderChanges(item.changes)}
                                </Stack>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            </Stack>
        </Card>
    );
} 