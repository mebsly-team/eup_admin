import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';

import axiosInstance from 'src/utils/axios';

import { useGetCategories } from 'src/api/category';
import { IMAGE_FOLDER_PATH } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export type CampaignProduct = { id: number; title?: string; ean?: string; images?: string[] };

const PAGE_SIZE = 200;
// A whole brand or category is added in one go; stop before it becomes unworkable.
const BULK_LIMIT = 1000;
const SEARCH_DELAY = 350;

export async function fetchProducts(query: string, max = BULK_LIMIT) {
  const found: CampaignProduct[] = [];
  let total = 0;
  for (let offset = 0; offset < max; offset += PAGE_SIZE) {
    // eslint-disable-next-line no-await-in-loop
    const { data } = await axiosInstance.get(
      `/products/?short=true&${query}&limit=${PAGE_SIZE}&offset=${offset}`
    );
    const results = data.results || [];
    total = data.count || results.length;
    found.push(...results.map(({ id, title, ean, images }: CampaignProduct) => ({ id, title, ean, images })));
    if (!data.next || !results.length) break;
  }
  return { products: found.slice(0, max), total };
}

type Option = { id: number; name: string };

const flattenCategories = (categories: any[], prefix = ''): Option[] =>
  (categories || []).flatMap((category) => [
    { id: category.id, name: `${prefix}${category.name}` },
    ...flattenCategories(category.sub_categories, `${prefix}${category.name} › `),
  ]);

type Props = {
  products: CampaignProduct[];
  loading: boolean;
  onChange: (products: CampaignProduct[]) => void;
};

export default function CampaignProductsCard({ products, loading, onChange }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { items: categories } = useGetCategories();
  const categoryOptions = useMemo(() => flattenCategories(categories as any[]), [categories]);

  const [options, setOptions] = useState<CampaignProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [input, setInput] = useState('');
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [brand, setBrand] = useState<Option | null>(null);
  const [category, setCategory] = useState<Option | null>(null);
  const [adding, setAdding] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const selectedIds = useMemo(() => new Set(products.map((product) => product.id)), [products]);

  const latestSearch = useRef(0);
  useEffect(() => {
    const term = input.trim();
    if (term.length < 2) {
      setOptions([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      latestSearch.current += 1;
      const requestId = latestSearch.current;
      setSearching(true);
      try {
        const { data } = await axiosInstance.get(
          `/products/?short=true&search=${encodeURIComponent(term)}&limit=20`
        );
        if (requestId === latestSearch.current) setOptions(data.results || []);
      } catch (error) {
        console.error(error);
      }
      if (requestId === latestSearch.current) setSearching(false);
    }, SEARCH_DELAY);
    return () => clearTimeout(timer);
  }, [input]);

  const searchBrands = async (term: string) => {
    try {
      const { data } = await axiosInstance.get(
        `/brands/?limit=20${term ? `&search=${encodeURIComponent(term)}` : ''}`
      );
      setBrandOptions((data.results || data || []).map(({ id, name }: Option) => ({ id, name })));
    } catch (error) {
      console.error(error);
    }
  };

  const add = (extra: CampaignProduct[]) => {
    const fresh = extra.filter((product) => !selectedIds.has(product.id));
    if (fresh.length) onChange([...products, ...fresh]);
    return fresh.length;
  };

  const handleBulkAdd = async () => {
    const query = brand ? `brand=${brand.id}` : `category=${category?.id}`;
    const label = brand?.name || category?.name;
    setAdding(true);
    try {
      const { products: found, total } = await fetchProducts(query);
      const added = add(found);
      enqueueSnackbar(
        total > found.length
          ? `${added} producten toegevoegd; ${label} heeft er ${total}, het maximum per keer is ${BULK_LIMIT}`
          : `${added} ${added === 1 ? 'product' : 'producten'} toegevoegd uit ${label}`,
        { variant: total > found.length ? 'warning' : 'success' }
      );
      setBrand(null);
      setCategory(null);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Producten ophalen mislukt', { variant: 'error' });
    }
    setAdding(false);
  };

  const visible = showAll ? products : products.slice(0, 8);

  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6">Producten</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          De banner opent een pagina met deze producten. Zonder producten zoekt de webshop op de
          naam van de actie.
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Autocomplete
          value={null}
          options={options}
          loading={searching}
          inputValue={input}
          onInputChange={(_, value, reason) => {
            if (reason !== 'reset') setInput(value);
          }}
          onChange={(_, value) => {
            if (value) {
              add([value]);
              setInput('');
            }
          }}
          filterOptions={(list) => list}
          getOptionLabel={(option) => option.title || `Product ${option.id}`}
          getOptionDisabled={(option) => selectedIds.has(option.id)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText={input.trim().length < 2 ? 'Typ minstens 2 tekens' : 'Geen producten gevonden'}
          blurOnSelect={false}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <ProductLine product={option} />
              {selectedIds.has(option.id) && (
                <Typography variant="caption" sx={{ ml: 1, flexShrink: 0 }}>
                  toegevoegd
                </Typography>
              )}
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Product toevoegen" placeholder="Zoek op naam of EAN" />
          )}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <Autocomplete
            fullWidth
            size="small"
            value={brand}
            options={brandOptions}
            disabled={!!category}
            onOpen={() => !brandOptions.length && searchBrands('')}
            onInputChange={(_, value, reason) => reason === 'input' && searchBrands(value)}
            onChange={(_, value) => setBrand(value)}
            filterOptions={(list) => list}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Heel merk" />}
          />
          <Autocomplete
            fullWidth
            size="small"
            value={category}
            options={categoryOptions}
            disabled={!!brand}
            onChange={(_, value) => setCategory(value)}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
            renderInput={(params) => <TextField {...params} label="Hele categorie" />}
          />
          <LoadingButton
            type="button"
            variant="outlined"
            color="inherit"
            loading={adding}
            disabled={!brand && !category}
            onClick={handleBulkAdd}
            sx={{ flexShrink: 0 }}
          >
            Toevoegen
          </LoadingButton>
        </Stack>

        <Box>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {loading
                ? 'Producten laden…'
                : `${products.length} ${products.length === 1 ? 'product' : 'producten'} in deze actie`}
            </Typography>
            {products.length > 0 && (
              <Button type="button" size="small" color="error" onClick={() => onChange([])}>
                Alles verwijderen
              </Button>
            )}
          </Stack>

          {visible.length > 0 && (
            <Stack
              divider={<Box sx={{ borderBottom: (theme) => `dashed 1px ${theme.palette.divider}` }} />}
              sx={{ borderRadius: 1, border: (theme) => `solid 1px ${theme.palette.divider}` }}
            >
              {visible.map((product) => (
                <Stack key={product.id} direction="row" alignItems="center" sx={{ px: 1.5, py: 0.75 }}>
                  <ProductLine product={product} />
                  <IconButton
                    type="button"
                    size="small"
                    onClick={() => onChange(products.filter((item) => item.id !== product.id))}
                    aria-label={`${product.title || product.id} verwijderen`}
                  >
                    <Iconify icon="mingcute:close-line" width={18} />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}

          {products.length > 8 && (
            <Button type="button" size="small" onClick={() => setShowAll(!showAll)} sx={{ mt: 1 }}>
              {showAll ? 'Minder tonen' : `Alle ${products.length} tonen`}
            </Button>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

function ProductLine({ product }: { product: CampaignProduct }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flexGrow: 1 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 0.75,
          overflow: 'hidden',
          bgcolor: 'background.neutral',
        }}
      >
        {product.images?.[0] && (
          <Box
            component="img"
            alt=""
            loading="lazy"
            src={`${IMAGE_FOLDER_PATH}${product.images[0]}`}
            sx={{ width: 1, height: 1, objectFit: 'contain' }}
          />
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap title={product.title}>
          {product.title || `Product ${product.id}`}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {product.ean || `ID ${product.id}`}
        </Typography>
      </Box>
    </Stack>
  );
}
