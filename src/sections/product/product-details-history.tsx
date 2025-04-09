import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { fDateTime } from 'src/utils/format-time';

import { IProductItem } from 'src/types/product';

// ----------------------------------------------------------------------

type Props = {
    currentProduct: IProductItem;
};

export default function ProductDetailsHistory({ currentProduct }: Props) {
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
            {currentProduct?.history?.map((item, index) => {
                const firstTimeline = index === 0;
                const lastTimeline = index === (currentProduct?.history?.length || 0) - 1;

                return (
                    <TimelineItem key={item.date}>
                        <TimelineSeparator>
                            <TimelineDot color={(firstTimeline && 'primary') || 'grey'} />
                            {lastTimeline ? null : <TimelineConnector />}
                        </TimelineSeparator>

                        <TimelineContent>
                            <Typography variant="subtitle2">{item.event}</Typography>

                            <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                                {fDateTime(item.date)}
                            </Box>
                        </TimelineContent>
                    </TimelineItem>
                );
            })}
        </Timeline>
    );

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="History" />
            <Stack
                spacing={3}
                alignItems={{ md: 'flex-start' }}
                direction={{ xs: 'column-reverse', md: 'row' }}
                sx={{ p: 3 }}
            >
                {renderTimeline}
            </Stack>
        </Card>
    );
} 