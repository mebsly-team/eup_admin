import { Controller, useFormContext } from 'react-hook-form';

import TextField, { TextFieldProps } from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
};

export default function RHFTextField({ name, helperText, type, ...other }: Props) {
  const { control } = useFormContext();

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
