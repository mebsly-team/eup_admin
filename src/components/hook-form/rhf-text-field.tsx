import { Controller, useFormContext } from 'react-hook-form';

import { Theme, SxProps } from '@mui/system';
import TextField, { TextFieldProps } from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
  labelColor?: any; // Add labelColor prop
};

export default function RHFTextField({ name, helperText, type, labelColor, ...other }: Props) {
  const { control } = useFormContext();
  const labelSx: SxProps<Theme> = {
    color: `${labelColor} !important`, // Set the label color with !important
  };
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={field.value}
          onWheelCapture={(e) => {
            e.target.blur();
          }}
          onChange={(event) => {
            if (type === 'number' && event.target.value !== '') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          // autoComplete="off"
          InputLabelProps={{
            shrink: true,
            sx: labelSx,
          }}
          InputProps={{
            style: {
              // Inline styles for TextField component
              '& input:-webkit-autofill': {
                // Styling when autofill is triggered
                transitionDelay: '9999s', // Example transition delay
              },
            } as any, // Casting to 'any' to bypass TypeScript's type checking
          }}
          {...other}
        />
      )}
    />
  );
}
