import * as React from 'react';
import { FormikReimaginedBagContext } from './FormikContext';
import { FormikReimaginedValues } from './types';
import { FormikReimaginedProps } from './types.props';

/**
 * Hook to access the current Formik bag from context, analogous to Formik's
 * `useFormikContext`. Must be used inside a `withFormikReimagined` wrapped
 * component or a `FormikReimaginedProvider`.
 */
export function useFormikReimaginedContext<
  Values extends FormikReimaginedValues = FormikReimaginedValues
>(): FormikReimaginedProps<Values> {
  const bag = React.useContext(FormikReimaginedBagContext);
  if (bag == null) {
    throw new Error(
      'useFormikReimaginedContext() is used outside of a FormikReimagined context. ' +
        'Wrap your component with withFormikReimagined() or FormikReimaginedProvider.'
    );
  }
  return bag as FormikReimaginedProps<Values>;
}
