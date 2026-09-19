import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import axiosInstance from 'src/utils/axios';

import { fDateTime } from 'src/utils/format-time';

import { IProductItem } from 'src/types/product';

// ----------------------------------------------------------------------

type HistoryEntry = {
    date: Date | string;
    event: unknown;
};

type Props = {
    currentProduct: IProductItem;
};

// The log is not part of the product payload any more: it averages 9 KB per
// product and only this card ever showed it, so it is fetched on request.
export default function ProductDetailsHistory({ currentProduct }: Props) {
    const [history, setHistory] = useState<HistoryEntry[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const knownCount = currentProduct?.history_count;

    const loadHistory = useCallback(async () => {
        if (!currentProduct?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await axiosInstance.get(`/products/${currentProduct.id}/history/`);
            setHistory(Array.isArray(data?.history) ? data.history : []);
        } catch (e) {
            console.error('ProductDetailsHistory - failed to load history:', e);
            setError('Geschiedenis kon niet worden geladen');
        } finally {
            setIsLoading(false);
        }
    }, [currentProduct?.id]);

    const formatHistoryEvent = (event: unknown): string => {
        if (typeof event === 'string') {
            return event;
        }
        if (event && typeof event === 'object') {
            const e = event as {
                order_id?: number | string;
                status?: string;
                delta?: number | string;
            };
            const parts: string[] = [];
            if (e.order_id !== undefined) parts.push(`Order ${e.order_id}`);
            if (e.status) parts.push(String(e.status));
            if (e.delta !== undefined) parts.push(`Δ${e.delta}`);
            const joined = parts.join(' ');
            return joined || '[event]';
        }
        return '';
    };

    const renderEventDetails = (event: unknown) => {
        if (!event || typeof event !== 'object') return null;
        const e = event as {
            is_parent?: boolean;
            stocks?: Record<string, unknown> | undefined;
        };
        const hasMeta = e.is_parent !== undefined;
        const hasStocks = e.stocks && typeof e.stocks === 'object';
        if (!hasMeta && !hasStocks) return null;
        return (
            <Box sx={{ mt: 0.5 }}>
                {hasMeta ? (
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        is_parent: {String(e.is_parent)}
                    </Typography>
                ) : null}
                {hasStocks ? (
                    <Box sx={{ mt: 0.25 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            stocks
                        </Typography>
                        <Box sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'text.secondary', typography: 'caption' }}>
                            {JSON.stringify(e.stocks, null, 2)}
                        </Box>
                    </Box>
                ) : null}
            </Box>
        );
    };

    const renderTimeline = (
        <Timeline
            sx={{
                p: 0,
                m: 0,
                [`& .${timelineItemClasses.root}:before`]: {
                    flex: 0,
                    padding: 0,
                },
            }}
        >
            {history?.map((item, index) => {
                const firstTimeline = index === 0;
                const lastTimeline = index === (history?.length || 0) - 1;

                return (
                    <TimelineItem key={`${String(item.date)}-${index}`}>
                        <TimelineSeparator>
                            <TimelineDot color={(firstTimeline && 'primary') || 'grey'} />
                            {lastTimeline ? null : <TimelineConnector />}
                        </TimelineSeparator>

                        <TimelineContent>
                            <Typography variant="subtitle2">{formatHistoryEvent(item.event)}</Typography>

                            {renderEventDetails(item.event)}

                            <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                                {fDateTime(item.date)}
                            </Box>
                        </TimelineContent>
                    </TimelineItem>
                );
            })}
        </Timeline>
    );

    const renderBody = () => {
        if (history === null) {
            return (
                <Stack spacing={1} alignItems="flex-start">
                    <LoadingButton
                        variant="outlined"
                        loading={isLoading}
                        disabled={knownCount === 0}
                        onClick={loadHistory}
                    >
                        {knownCount === 0 ? 'Geen geschiedenis' : 'Geschiedenis laden'}
                        {knownCount ? ` (${knownCount})` : ''}
                    </LoadingButton>
                    {error ? (
                        <Stack spacing={1} alignItems="flex-start">
                            <Typography variant="caption" color="error">
                                {error}
                            </Typography>
                            <Button size="small" onClick={loadHistory}>
                                Opnieuw proberen
                            </Button>
                        </Stack>
                    ) : null}
                </Stack>
            );
        }

        if (history.length === 0) {
            return (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Geen geschiedenis
                </Typography>
            );
        }

        return renderTimeline;
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="History" />
            <Stack
                spacing={3}
                alignItems={{ md: 'flex-start' }}
                direction={{ xs: 'column-reverse', md: 'row' }}
                sx={{ p: 3 }}
            >
                {renderBody()}
            </Stack>
        </Card>
    );
}
