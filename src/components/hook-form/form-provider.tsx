/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { UseFormReturn, FormProvider as Form } from 'react-hook-form';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  methods: UseFormReturn<any>;
  onSubmit?: VoidFunction;
};

export default function FormProvider({ children, onSubmit, methods }: Props) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission on Enter key press
    }
  };
  return (
    <Form {...methods}>
      <form onSubmit={onSubmit} onKeyDown={handleKeyDown}>
        {children}
      </form>
    </Form>
  );
}
