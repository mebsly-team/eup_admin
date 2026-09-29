import { forwardRef } from 'react';
import { Icon } from '@iconify/react';

import Box, { BoxProps } from '@mui/material/Box';

import { IconifyProps } from './types';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  icon: IconifyProps;
}

const Iconify = forwardRef<SVGElement, Props>(({ icon, width = 20, sx, ...other }, ref) => (
  <Box
    ref={ref}
    component={Icon}
    className="component-iconify"
    icon={icon}
    // Iconify rewrites the svg body on every render, so a click that starts
    // on a <path> is dropped when a render lands before mouseup. Keep the
    // svg itself as the event target.
    sx={{ width, height: width, '& *': { pointerEvents: 'none' }, ...sx }}
    {...other}
  />
));

export default Iconify;
