import React from 'react';

import { Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const Rating = ({ defaultValue = 0 }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
    {[...Array(5)].map((_, index) => {
      const ratingValue = index + 1;
      const isFull = ratingValue <= defaultValue;
      const isHalf = ratingValue - 0.4 >= defaultValue;

      return (
        <span key={index}>
          {isFull ? (
            <StarIcon color="warning" />
          ) : isHalf ? (
            <StarHalfIcon color="warning" />
          ) : (
            <StarBorderIcon color="warning" />
          )}
        </span>
      );
    })}
  </Box>
);

export default Rating;
