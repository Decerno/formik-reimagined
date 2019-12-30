import * as React from 'react';
import { FormikReimaginedContextType } from './types';

export const FormikReimaginedContext = React.createContext<FormikReimaginedContextType<any>>(
  undefined as any
);
export const FormikReimaginedProvider = FormikReimaginedContext.Provider;
export const FormikReimaginedConsumer = FormikReimaginedContext.Consumer;

