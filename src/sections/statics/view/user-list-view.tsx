import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import { Button, TextField } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/utils/axios';

import { useTranslate } from 'src/locales';

import { useSnackbar } from 'src/components/snackbar';

import { IBrandItem } from 'src/types/brand';

type Props = {
  currentBrand?: IBrandItem;
};

export default function BrandNewEditForm({ currentBrand }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    getAll();
  }, []);

  const getAll = async () => {
    const { data } = await axiosInstance.get(`/sections/?nocache=true`);
    const sortedSections = data.sort((a, b) => {
      const nameA = a.section_name.toLowerCase();
      const nameB = b.section_name.toLowerCase();
      const numA = parseInt(nameA.match(/\d+/), 10) || 0; // Extract number from name
      const numB = parseInt(nameB.match(/\d+/), 10) || 0; // Extract number from name
      const textA = nameA.replace(/\d+/g, ''); // Remove number from name
      const textB = nameB.replace(/\d+/g, ''); // Remove number from name
      if (textA < textB) {
        return -1;
      }
      if (textA > textB) {
        return 1;
      }
      return numA - numB; // If text part is equal, compare numbers
    });
    setSections(sortedSections || []);
    setSections(data || []);
  };

  const saveText = async ({ id, section_name, section_data }) => {
    try {
      const response = await axiosInstance.put(`/sections/${id}/`, { section_name, section_data });
      enqueueSnackbar(t('update_success'));
    } catch (error) {
      if (error) {
        console.log('error', error);
        const errorData = error;
        if (errorData) {
          Object.entries(errorData).forEach(([fieldName, errors]) => {
            errors.forEach((errorMsg) => {
              enqueueSnackbar({
                variant: 'error',
                message: `${t(fieldName)}: ${errorMsg}`,
              });
            });
          });
        }
      } else {
        console.error('Error:', error.message);
        enqueueSnackbar({ variant: 'error', message: t('error') });
      }
    }
  };
  const handleInputChange = (event, item) => {
    const newValue = event.target.value;
    // Update the section_data property of the corresponding item
    item.section_data = newValue;
  };
  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: '1fr 150px',
            }}
          >
            {sections?.map((item) => (
              <React.Fragment key={item.id}>
                <TextField
                  id={item.id}
                  label={item.section_name}
                  defaultValue={item.section_data}
                  onChange={(event) => handleInputChange(event, item)}
                />
                <Button variant="outlined" onClick={() => saveText(item)}>
                  {t('save')}
                </Button>
              </React.Fragment>
            ))}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
