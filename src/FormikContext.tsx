import * as React from 'react';
import { Message } from './reducer';

export const FormikReimaginedStateContext = React.createContext<any>(
  undefined as any
);
export const FormikReimaginedUpdateContext = React.createContext<
  React.Dispatch<Message>
>(undefined as any);

/**
 * Holds the full injected Formik bag (values, helpers, handlers, computed
 * props). Populated by {@link withFormikReimagined} and
 * `FormikReimaginedProvider` so that context based hooks/components such as
 * `useFormikReimaginedContext`, `Field`, `ErrorMessage` and `Form` can access
 * the complete API.
 */
export const FormikReimaginedBagContext = React.createContext<any>(
  undefined as any
);
