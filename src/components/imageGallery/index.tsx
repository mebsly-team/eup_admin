import { useMemo, useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { fDate } from 'src/utils/format-time';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import Lightbox, { useLightBox } from 'src/components/lightbox';
import Checkbox from '@mui/material/Checkbox';
import Pagination from '@mui/material/Pagination';
import Grid from '@mui/material/Grid';
import { IBrandItem } from 'src/types/brand';
import { green } from '@mui/material/colors';

type Props = {
  gallery: IBrandItem[];
};

export default function ImageGallery({
  gallery = [],
  variant = 'input',
  open = true,
  onClose = () => { },
  error,
  maxNumberOfSelectedImages = 1,
  onlyPreviewOneImage = true,
  onSelect = () => { },
}: Props) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [imageList, setImageList] = useState(gallery);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const itemsPerPage = 2; // Change this value to set the number of images per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);


  useEffect(() => {
    getAll();
  }, [searchQuery, currentPage]);

  const getAll = async () => {
    const searchFilter = searchQuery ? `&search=${searchQuery}` : ""
    const offset = (currentPage - 1) * itemsPerPage;
    const limit = itemsPerPage;
    const { data } = await axiosInstance.get(`/images/?&offset=${offset}&limit=${limit}${searchFilter}`);
    setTotalItems(data.count);
    setImageList(data?.results);
  };

  const slides = imageList.map((slide) => ({
    src: slide.image,
  }));

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };
  const handleSelect = (imageId: string) => {
    setSelectedImages((prevSelectedImages) => {
      if (prevSelectedImages.includes(imageId)) {
        // Deselect the image
        return prevSelectedImages.filter((id) => id !== imageId);
      } else {
        // Select the image if limit is not reached
        if (prevSelectedImages.length < maxNumberOfSelectedImages) {
          return [...prevSelectedImages, imageId];
        } else {
          return [...prevSelectedImages, imageId].slice(1);
        }
      }
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
        setUploadError("Please select an image to upload.");
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("image", selectedFile);

      // Make a POST request to the image upload endpoint
      await axiosInstance.post("/images/new/", formData);

      // If successful, you might want to refresh the image list or take other actions
      getAll();
    } catch (error) {
      setUploadError("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            ...({
              maxWidth: 720,
            }),
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>Image Gallery</DialogTitle>
        <DialogContent>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              name="ean"
              variant="filled"
              fullWidth
              label="Search"
              placeholder="Type here..."
              InputLabelProps={{ shrink: true }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          <Grid container spacing={2}>
            {imageList.map((image) => (
              <Grid item xs={12} sm={6} md={4} key={image.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <Checkbox
                    checked={selectedImages.includes(image.id)}
                    onChange={() => handleSelect(image.id)}
                    sx={{
                      position: 'absolute',
                      top: theme.spacing(1),
                      left: theme.spacing(1),
                      zIndex: 10,
                      color: "white",
                      '&.Mui-checked': {
                        color: "white",
                      },
                    }}
                  />
                  <Image
                    alt="gallery"
                    ratio="1/1"
                    src={image.image}
                    onClick={() => lightbox.onOpen(image.image)}
                  />
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

        <DialogActions style={{ display: 'flex', justifyContent: "space-between", alignItems: 'top' }}>
          <div >
            <div>
              <div style={{ display: 'flex', justifyContent: "left", alignItems: 'top' }}>
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
                    Select File
                  </Button>
                </label>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleImageUpload}
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {selectedFile && (
                <Typography variant="caption" sx={{ marginRight: 1, marginLeft: 1, color: 'text.secondary' }}>
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
              Cancel
            </Button>

            <Button
              disabled={error}
              variant="contained"
              onClick={() => {
                onSelect(selectedImages);
              }}
            >
              Select
            </Button>
          </div>
        </DialogActions>

      </Dialog>
    </>
  );
}
