import * as React from 'react';
import { Message } from './reducer';

export const FormikReimaginedValueContext = React.createContext<any>(
  undefined as any
);
export const FormikReimaginedUpdateContext = React.createContext<
  React.Dispatch<Message<any>>
>(undefined as any);
