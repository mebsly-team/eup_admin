import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { ICampaignItem } from 'src/types/campaign';

import {
  discountLabel,
  campaignPeriod,
  CAMPAIGN_STATUS,
  campaignPeriodHint,
} from './campaign-utils';

// ----------------------------------------------------------------------

export const CAMPAIGN_TABLE_COLUMNS = 7;

type Props = {
  row: ICampaignItem;
  // Where the campaign sits in the storefront hero, when it is running.
  heroSlot?: string;
  onEditRow: (id: number) => void;
  onToggleActive: (row: ICampaignItem, isActive: boolean) => void;
  onRemoveEndDate: (row: ICampaignItem) => void;
  onDuplicateRow: (row: ICampaignItem) => void;
  onDeleteRow: (id: number) => Promise<void> | void;
};

export default function CampaignTableRow({
  row,
  heroSlot,
  onEditRow,
  onToggleActive,
  onRemoveEndDate,
  onDuplicateRow,
  onDeleteRow,
}: Props) {
  const { id, name, description, images, is_active, status, product_count } = row;
  const { t } = useTranslate();
  const confirm = useBoolean();
  const popover = usePopover();

  const statusMeta = CAMPAIGN_STATUS[status] || CAMPAIGN_STATUS.off;
  const discount = discountLabel(row.discount_percentage);

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ pl: 2, pr: 1, maxWidth: { xs: '60vw', md: 380 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 72,
                height: 48,
                p: 0.5,
                flexShrink: 0,
                borderRadius: 1,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.neutral',
                color: 'text.disabled',
              }}
            >
              {images?.[0] ? (
                <Box
                  component="img"
                  alt=""
                  loading="lazy"
                  src={`${IMAGE_FOLDER_PATH}${images[0]}`}
                  sx={{ width: 1, height: 1, objectFit: 'contain' }}
                />
              ) : (
                <Iconify icon="solar:gallery-bold" width={20} />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Link
                component={RouterLink}
                href={paths.dashboard.campaign.edit(String(id))}
                variant="subtitle2"
                color="inherit"
                noWrap
                title={name}
                sx={{ display: 'block' }}
              >
                {name}
              </Link>
              {description && (
                <Typography
                  variant="caption"
                  noWrap
                  title={description}
                  sx={{ color: 'text.secondary', display: 'block' }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Stack>
        </TableCell>

        <TableCell sx={{ px: 1 }}>
          <Label variant="soft" color={statusMeta.color}>
            {statusMeta.label}
          </Label>
          {heroSlot && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
              {heroSlot}
            </Typography>
          )}
        </TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap', display: { xs: 'none', sm: 'table-cell' } }}>
          <Typography variant="body2">{campaignPeriod(row)}</Typography>
          <Typography
            variant="caption"
            sx={{ color: status === 'expired' ? 'warning.dark' : 'text.secondary' }}
          >
            {campaignPeriodHint(row)}
          </Typography>
        </TableCell>

        <TableCell
          align="right"
          sx={{
            px: 1,
            fontVariantNumeric: 'tabular-nums',
            display: { xs: 'none', md: 'table-cell' },
          }}
        >
          {discount || <Box component="span" sx={{ color: 'text.disabled' }}>–</Box>}
        </TableCell>

        <TableCell
          align="right"
          sx={{
            px: 1,
            fontVariantNumeric: 'tabular-nums',
            display: { xs: 'none', md: 'table-cell' },
          }}
        >
          {product_count > 0 ? (
            product_count
          ) : (
            <Box component="span" sx={{ color: 'text.disabled' }} title="Banner zoekt op de naam">
              –
            </Box>
          )}
        </TableCell>

        <TableCell sx={{ px: 1 }}>
          <Switch
            checked={is_active}
            onChange={(event) => onToggleActive(row, event.target.checked)}
            inputProps={{ 'aria-label': `${name} aan of uit zetten` }}
          />
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
            aria-label={`Acties voor ${name}`}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 220 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow(id);
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          {t('view_edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDuplicateRow(row);
            popover.onClose();
          }}
        >
          <Iconify icon="solar:copy-bold" />
          Dupliceren
        </MenuItem>
        {row.end_date && (
          <MenuItem
            onClick={() => {
              onRemoveEndDate(row);
              popover.onClose();
            }}
          >
            <Iconify icon="solar:calendar-minimalistic-bold" />
            Einddatum verwijderen
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          {t('delete')}
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('delete')}
        content={
          <>
            {t('sure_delete')}
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              {name}
            </Typography>
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await onDeleteRow(id);
              confirm.onFalse();
            }}
          >
            {t('delete')}
          </Button>
        }
      />
    </>
  );
}
