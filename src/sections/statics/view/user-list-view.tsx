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
import Editor from 'src/components/editor';

interface Section {
  id: number;
  section_name: string;
  section_data: string;
}

type Props = {
  currentBrand?: IBrandItem;
};

export default function BrandNewEditForm({ currentBrand }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { t, onChangeLang } = useTranslate();
  const [sections, setSections] = useState<Section[]>([]);
  console.log("🚀 ~ BrandNewEditForm ~ sections:", sections)

  useEffect(() => {
    getAll();
  }, []);

  const getAll = async () => {
    const { data } = await axiosInstance.get(`/sections/?nocache=true`);
    const sortedSections = data.sort((a: Section, b: Section) => {
      const nameA = a.section_name.toLowerCase();
      const nameB = b.section_name.toLowerCase();
      const numA = parseInt(nameA.match(/\d+/)?.[0] || '0', 10) || 0;
      const numB = parseInt(nameB.match(/\d+/)?.[0] || '0', 10) || 0;
      const textA = nameA.replace(/\d+/g, '');
      const textB = nameB.replace(/\d+/g, '');
      if (textA < textB) {
        return -1;
      }
      if (textA > textB) {
        return 1;
      }
      return numA - numB;
    });
    setSections(sortedSections || []);
  };

  const saveText = async ({ id, section_name, section_data }: Section) => {
    try {
      const response = await axiosInstance.put(`/sections/${id}/`, { section_name, section_data });
      enqueueSnackbar(t('update_success'));
    } catch (error: any) {
      if (error) {
        console.log('error', error);
        const errorData = error.response?.data;
        if (errorData) {
          Object.entries(errorData).forEach(([fieldName, errors]: [string, any]) => {
            if (Array.isArray(errors)) {
              errors.forEach((errorMsg: string) => {
                enqueueSnackbar({
                  variant: 'error',
                  message: `${t(fieldName)}: ${errorMsg}`,
                });
              });
            }
          });
        }
      } else {
        console.error('Error:', error.message);
        enqueueSnackbar({ variant: 'error', message: t('error') });
      }
    }
  };

  const handleInputChange = (value: string, item: Section) => {
    if (item) {
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === item.id
            ? { ...section, section_data: value }
            : section
        )
      );
    }
  };

  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, item: Section) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === item.id
          ? { ...section, section_data: event.target.value }
          : section
      )
    );
  };

  const careersSection = sections.find((item) => item.section_name === 'careers');

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
            <Editor
              id={`editor`}
              value={careersSection?.section_data || ''}
              onChange={(value) => handleInputChange(value, careersSection!)}
              simple
              sx={{ height: 500 }}
            />
            <Button
              variant="outlined"
              onClick={() => careersSection && saveText(careersSection)}
              disabled={!careersSection}
            >
              {t('save')}
            </Button>
          </Box>
        </Card>
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
                  id={item.id.toString()}
                  label={item.section_name}
                  defaultValue={item.section_data}
                  onChange={(event) => handleTextFieldChange(event, item)}
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
