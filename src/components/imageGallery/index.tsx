import { useState, useEffect, SetStateAction } from 'react'; // Import debounce function

import BarcodeScannerComponent from 'react-qr-barcode-scanner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import QRCodeIcon from '@mui/icons-material/QrCode';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import Lightbox, { useLightBox } from 'src/components/lightbox';

import { IBrandItem } from 'src/types/brand';

type Props = {
  gallery: IBrandItem[];
};

export default function ImageGallery({
  gallery = [],
  variant = 'input',
  open = true,
  onClose = () => {},
  error,
  maxNumberOfSelectedImages = 1,
  onlyPreviewOneImage = true,
  onSelect = () => {},
  itemsPerPage = 9,
  name = '',
}: Props) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [imageList, setImageList] = useState(gallery);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const { t, onChangeLang } = useTranslate();
  const [qrReaderOpen, setQRReaderOpen] = useState(false);

  useEffect(() => {
    getAll();
  }, [searchQuery, currentPage]);
  const handleToggleQRReader = () => {
    setQRReaderOpen(!qrReaderOpen);
  };
  const handleScanQRCode = (data: SetStateAction<string>) => {
    if (data) {
      setSearchQuery(data);
      setQRReaderOpen(false);
    }
  };
  const getAll = async () => {
    const searchFilter = searchQuery ? `&search=${searchQuery}` : '';
    const offset = (currentPage - 1) * itemsPerPage;
    const limit = itemsPerPage;
    const { data } = await axiosInstance.get(
      `/images/?&offset=${offset}&limit=${limit}${searchFilter}`
    );
    setTotalItems(data.count);
    setImageList(data?.results);
  };

  const slides = imageList.map((slide) => ({
    src: `https://eup-data.s3.amazonaws.com/eup/uploads/${slide.name}`,
  }));

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };
  const handleSelect = (imageId: string) => {
    setSelectedImages((prevSelectedImages) => {
      if (prevSelectedImages.includes(imageId)) {
        // Deselect the image
        return prevSelectedImages.filter((id) => id !== imageId);
      }
      // Select the image if limit is not reached
      if (prevSelectedImages.length < maxNumberOfSelectedImages) {
        return [...prevSelectedImages, imageId];
      }
      return [...prevSelectedImages, imageId];
    });
  };
  const lightbox = useLightBox(slides);

  // New state for image upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Function to handle image upload
  const handleImageUpload = async () => {
    try {
      if (!selectedFile) {
        setUploadError(t('image_select_error'));
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('url', selectedFile);
      // Append the ean value as the image name
      formData.append('name', name);

      // Make a POST request to the image upload endpoint
      await axiosInstance.post('/images/new/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // If successful, you might want to refresh the image list or take other actions
      getAll();
    } catch (error) {
      setUploadError(t('image_upload_error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await axiosInstance.delete(`/images/${id}/`);
      getAll();
    } catch (error) {
      setUploadError(t('image_delete_error'));
    }
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...{
            maxWidth: 720,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{t('image_gallery')}</DialogTitle>
      <DialogContent>
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            name="ean"
            variant="filled"
            fullWidth
            label={t('search')}
            placeholder={`${t('type_here')}...`}
            InputLabelProps={{ shrink: true }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <QRCodeIcon onClick={handleToggleQRReader} style={{ cursor: 'pointer' }} />
                </InputAdornment>
              ),
            }}
          />
          {qrReaderOpen && (
            <BarcodeScannerComponent
              onUpdate={(err, result) => {
                if (result) handleScanQRCode(result.text);
              }}
            />
          )}
        </Box>

        <Grid container spacing={2}>
          {imageList.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onDoubleClick={() => onSelect([`${image.name}`])}
              >
                <Checkbox
                  checked={selectedImages.includes(`${image.name}`)}
                  onChange={() => handleSelect(`${image.name}`)}
                  sx={{
                    position: 'absolute',
                    top: theme.spacing(1),
                    left: theme.spacing(1),
                    zIndex: 10,
                    background: 'black',
                    color: 'white',
                    'mix-blend-mode': 'difference',
                    '&.Mui-checked': {
                      color: 'cyan',
                    },
                  }}
                />
                <Image
                  alt="gallery"
                  ratio="1/1"
                  src={`https://eup-data.s3.amazonaws.com/eup/uploads/${image.name}`}
                  onClick={() => handleSelect(`${image.name}`)}
                  // onClick={() => lightbox.onOpen(image.url?.replace("eup-images", "eup-data"))}
                />
                <IconButton
                  style={{ position: 'absolute', top: 0, right: 0, color: 'black' }}
                  onClick={() => handleDeleteImage(image.id)}
                  label=""
                  icon="symbol"
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={24} />
                </IconButton>
                <ListItemText
                  sx={{
                    p: 2,
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    backgroundColor: alpha(theme.palette.grey[900], 0.7),
                    color: 'common.white',
                  }}
                  primary={image.name}
                  secondary={image.size}
                  primaryTypographyProps={{
                    noWrap: true,
                    typography: 'subtitle1',
                  }}
                  secondaryTypographyProps={{
                    mt: 0.5,
                    color: 'inherit',
                    component: 'span',
                    typography: 'body2',
                    sx: { opacity: 0.8 },
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ marginTop: 2, textAlign: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="small"
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>

        <Lightbox
          index={lightbox.selected}
          slides={onlyPreviewOneImage ? [slides[lightbox.selected]] : slides}
          open={lightbox.open}
          close={lightbox.onClose}
        />
      </DialogContent>

      <DialogActions
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'top' }}
      >
        <div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'top' }}>
              <label htmlFor="upload-input">
                <input
                  id="upload-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  component="span"
                  sx={{ marginRight: 1, marginLeft: 1, color: 'text.secondary' }}
                >
                  {t('image_select_file')}
                </Button>
              </label>

              <Button
                variant="contained"
                color="primary"
                onClick={handleImageUpload}
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? `${t('uploading')}...` : t('upload')}
              </Button>
            </div>
            {selectedFile && (
              <Typography
                variant="caption"
                sx={{ marginRight: 1, marginLeft: 1, color: 'text.secondary' }}
              >
                {selectedFile.name}
              </Typography>
            )}
            {uploadError && (
              <Typography color="error" sx={{ marginLeft: 1 }}>
                {uploadError}
              </Typography>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'top' }}>
          <Button variant="outlined" onClick={onClose} sx={{ marginRight: 1, marginLeft: 1 }}>
            {t('cancel')}
          </Button>

          <Button
            disabled={error || !selectedImages.length}
            variant="contained"
            onClick={() => {
              onSelect(selectedImages);
            }}
          >
            {t('select')}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
