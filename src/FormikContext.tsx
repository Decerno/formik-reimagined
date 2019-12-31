import * as React from 'react';
import { FormikReimaginedMessage } from './reducer';

export const FormikReimaginedValueContext = React.createContext<any>(
  undefined as any
);
export const FormikReimaginedUpdateContext = React.createContext<
  React.Dispatch<FormikReimaginedMessage<any>>
>(undefined as any);
