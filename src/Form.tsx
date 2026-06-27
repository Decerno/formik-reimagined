import * as React from 'react';
import { useFormikReimaginedContext } from './useFormikReimaginedContext';

export type FormReimaginedProps = React.FormHTMLAttributes<HTMLFormElement>;

/**
 * A `Form`-equivalent: a thin wrapper around `<form>` that calls `submitForm`
 * (with `preventDefault`) on submit. Other props are forwarded to the element.
 */
export const Form = React.forwardRef<HTMLFormElement, FormReimaginedProps>(
  ({ onSubmit, ...rest }, ref) => {
    const form = useFormikReimaginedContext();
    const handleSubmit = React.useCallback(
      (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) {
          (onSubmit as any)(e);
        }
        form.submitForm(e);
      },
      [form, onSubmit]
    );
    return React.createElement('form', { ref, onSubmit: handleSubmit, ...rest });
  }
);

Form.displayName = 'Form';
