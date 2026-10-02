import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import axiosInstance from 'src/utils/axios';

import Label from 'src/components/label';
import Editor from 'src/components/editor';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

type Section = {
  id: number;
  section_name: string;
  section_data: string;
};

// The dashboard header is fixed: one bar on small screens, two from lg up.
// Only from md up: the card is not sticky below that and `top` would shift it.
const STICKY_TOP = { md: 64, lg: 128 };

// The four service blocks under the hero: [title, subtitle] section names.
const USPS = [
  { icon: 'solar:delivery-bold', title: 'text1', subtitle: 'text2' },
  { icon: 'solar:shield-check-bold', title: 'text3', subtitle: 'text4' },
  { icon: 'solar:alarm-bold', title: 'text5', subtitle: 'text6' },
  { icon: 'solar:card-bold', title: 'text7', subtitle: 'text8' },
];

// Every section name the webshop reads; anything else in the table is unused.
const USED_NAMES = [
  'ads',
  'ads2',
  'careers',
  'text9',
  'text10',
  'text11',
  ...USPS.flatMap((usp) => [usp.title, usp.subtitle]),
];

const sectionNumber = (name: string) => parseInt(name.match(/\d+/)?.[0] || '0', 10);

export default function StaticsView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [sections, setSections] = useState<Section[]>([]);
  // Edited texts by section name; a name is only in here while it differs from the saved text.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUnused, setShowUnused] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data } = await axiosInstance.get(`/sections/?nocache=${Date.now()}`);
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const savedByName = useMemo(
    () => Object.fromEntries(sections.map((section) => [section.section_name, section])),
    [sections]
  );

  const unusedSections = useMemo(
    () =>
      sections
        .filter((section) => !USED_NAMES.includes(section.section_name))
        .sort(
          (a, b) =>
            sectionNumber(a.section_name) - sectionNumber(b.section_name) ||
            a.section_name.localeCompare(b.section_name)
        ),
    [sections]
  );

  const dirtyNames = Object.keys(drafts);

  const valueOf = (name: string) => drafts[name] ?? savedByName[name]?.section_data ?? '';

  const setValue = (name: string, value: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      if (value === (savedByName[name]?.section_data ?? '')) {
        delete next[name];
      } else {
        next[name] = value;
      }
      return next;
    });
  };

  // Warn before closing the tab with unsaved texts.
  const hasChanges = dirtyNames.length > 0;
  useEffect(() => {
    if (!hasChanges) return undefined;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasChanges]);

  const handleSave = async () => {
    setSaving(true);
    const results = await Promise.allSettled(
      dirtyNames.map(async (name) => {
        const payload = { section_name: name, section_data: drafts[name] };
        const existing = savedByName[name];
        const { data } = existing
          ? await axiosInstance.put(`/sections/${existing.id}/`, payload)
          : await axiosInstance.post(`/sections/`, payload);
        return data as Section;
      })
    );

    const saved = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    const failed = results.length - saved.length;

    if (saved.length) {
      setSections((prev) => {
        const next = prev.filter((section) => !saved.some((item) => item.id === section.id));
        return [...next, ...saved];
      });
      setDrafts((prev) => {
        const next = { ...prev };
        saved.forEach((item) => {
          if (next[item.section_name] === item.section_data) delete next[item.section_name];
        });
        return next;
      });
    }

    if (failed) {
      results.forEach((result) => {
        if (result.status === 'rejected') console.error(result.reason);
      });
      enqueueSnackbar({
        variant: 'error',
        message:
          failed === 1
            ? '1 tekst kon niet worden opgeslagen. Probeer het opnieuw.'
            : `${failed} teksten konden niet worden opgeslagen. Probeer het opnieuw.`,
      });
    } else {
      enqueueSnackbar('Opgeslagen. De webshop toont de nieuwe teksten direct.');
    }
    setSaving(false);
  };

  const field = (name: string, label: string, multiline = false, hint = '') => (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={valueOf(name)}
      onChange={(event) => setValue(name, event.target.value)}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      helperText={hint || undefined}
      focused={name in drafts ? true : undefined}
      color={name in drafts ? 'warning' : undefined}
    />
  );

  const renderHeader = (
    <Card sx={{ position: { md: 'sticky' }, top: STICKY_TOP, zIndex: 10, mb: 3 }}>
      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        alignItems="center"
        spacing={1.5}
        sx={{ px: 2.5, py: 1.5 }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 260px' }}>
          <Typography variant="h5">Websiteteksten</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Vaste teksten op de homepage en de vacaturepagina van de webshop
          </Typography>
        </Box>

        {hasChanges && (
          <>
            <Label color="warning" sx={{ textTransform: 'none' }}>
              {dirtyNames.length === 1 ? '1 wijziging' : `${dirtyNames.length} wijzigingen`} niet
              opgeslagen
            </Label>
            <Button color="inherit" onClick={() => setDrafts({})} disabled={saving}>
              Ongedaan maken
            </Button>
          </>
        )}

        <LoadingButton
          variant="contained"
          loading={saving}
          disabled={!hasChanges}
          onClick={handleSave}
        >
          Opslaan
        </LoadingButton>
      </Stack>
    </Card>
  );

  const renderAnnouncement = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle
        title="Mededelingenbalk"
        hint="Gekleurde balk helemaal bovenaan elke pagina. Laat leeg om de balk te verbergen."
      />
      {field('ads', 'Mededeling', true)}
      {valueOf('ads') && (
        <Preview>
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: 0.5,
              typography: 'caption',
              textAlign: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            {valueOf('ads')}
          </Box>
        </Preview>
      )}
    </Card>
  );

  const renderUsps = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle
        title="Voordelen"
        hint="De vier blokken met een icoon direct onder de banner op de homepage."
      />
      <Box
        display="grid"
        gap={2}
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: '1fr',
          lg: 'repeat(2, 1fr)',
        }}
      >
        {USPS.map((usp, index) => (
          <Stack
            key={usp.title}
            direction="row"
            spacing={1.5}
            sx={{
              p: 2,
              borderRadius: 1,
              border: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            <Iconify
              icon={usp.icon}
              width={28}
              sx={{ mt: 0.75, flexShrink: 0, color: 'text.secondary' }}
            />
            <Stack spacing={1.5} sx={{ flex: '1 1 0', minWidth: 0 }}>
              {field(usp.title, `Blok ${index + 1} – titel`)}
              {field(usp.subtitle, `Blok ${index + 1} – ondertitel`)}
            </Stack>
          </Stack>
        ))}
      </Box>
    </Card>
  );

  const renderLastChance = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle
        title="Laatste kans"
        hint="Blok vóór de producten met de hoogste korting. Zonder titel wordt het blok niet getoond."
      />
      <Stack spacing={2}>
        {field('text9', 'Titel')}
        {field('text10', 'Tekst', true)}
        {field('text11', 'Knoptekst', false, 'Leeg = "Nu kopen"')}
      </Stack>
      {valueOf('text9') && (
        <Preview>
          <Stack
            spacing={1}
            alignItems="flex-start"
            sx={{ p: 2, borderRadius: 1, bgcolor: 'grey.800', color: 'common.white' }}
          >
            <Typography variant="subtitle1">{valueOf('text9')}</Typography>
            {valueOf('text10') && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {valueOf('text10')}
              </Typography>
            )}
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 0.75,
                typography: 'caption',
                fontWeight: 'fontWeightBold',
                bgcolor: 'common.white',
                color: 'grey.800',
              }}
            >
              {valueOf('text11') || 'Nu kopen'}
            </Box>
          </Stack>
        </Preview>
      )}
    </Card>
  );

  const renderVacancy = (
    <Card sx={{ p: 2.5 }}>
      <SectionTitle
        title="Vacature"
        hint="De banner staat onderaan de homepage en verwijst naar de vacaturepagina. Laat de bannertekst leeg om de banner te verbergen."
      />
      <Stack spacing={2.5}>
        {field('ads2', 'Bannertekst', true)}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Vacaturepagina
            {'careers' in drafts && (
              <Label color="warning" sx={{ ml: 1 }}>
                gewijzigd
              </Label>
            )}
          </Typography>
          <Editor
            id="statics-careers-editor"
            simple
            value={valueOf('careers')}
            onChange={(value, _delta, source) => {
              // Quill also fires when it normalises the loaded HTML; only user edits count.
              if (source === 'user') setValue('careers', value);
            }}
            sx={{ '& .ql-editor': { minHeight: 320, maxHeight: 560 } }}
          />
        </Box>
      </Stack>
    </Card>
  );

  const renderUnused = unusedSections.length > 0 && (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
          <Typography variant="h6">Niet in gebruik</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {unusedSections.length} teksten van oude banners. De webshop toont ze nergens meer.
          </Typography>
        </Box>
        <Button
          color="inherit"
          onClick={() => setShowUnused((prev) => !prev)}
          endIcon={
            <Iconify
              icon={showUnused ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            />
          }
        >
          {showUnused ? 'Verbergen' : 'Tonen'}
        </Button>
      </Stack>
      <Collapse in={showUnused} unmountOnExit>
        <Box
          display="grid"
          gap={2}
          gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }}
          sx={{ mt: 2.5 }}
        >
          {unusedSections.map((section) => (
            <Box key={section.id}>{field(section.section_name, section.section_name)}</Box>
          ))}
        </Box>
      </Collapse>
    </Card>
  );

  const renderLoading = (
    <Stack spacing={3}>
      {[120, 260, 220].map((height) => (
        <Skeleton key={height} variant="rounded" height={height} />
      ))}
    </Stack>
  );

  const renderError = (
    <Card sx={{ p: 5, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        De teksten konden niet worden geladen
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Controleer de verbinding en probeer het opnieuw.
      </Typography>
      <Button variant="outlined" color="inherit" onClick={load}>
        Opnieuw proberen
      </Button>
    </Card>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {renderHeader}

      {loading && renderLoading}
      {!loading && loadError && renderError}
      {!loading && !loadError && (
        <Stack spacing={3}>
          {renderAnnouncement}
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="flex-start" spacing={3}>
            <Box sx={{ flex: '1 1 0', minWidth: 0, width: 1 }}>{renderUsps}</Box>
            <Box sx={{ flex: { md: '0 0 360px' }, width: { xs: 1, md: 360 } }}>
              {renderLastChance}
            </Box>
          </Stack>
          {renderVacancy}
          {renderUnused}
        </Stack>
      )}
    </Container>
  );
}

// ----------------------------------------------------------------------

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {hint}
      </Typography>
    </Box>
  );
}

function Preview({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>
        Voorbeeld
      </Typography>
      {children}
    </Box>
  );
}
