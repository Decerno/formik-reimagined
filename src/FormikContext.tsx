import * as React from 'react';
import { Message } from './reducer';

export const FormikReimaginedStateContext = React.createContext<any>(
  undefined as any
);
export const FormikReimaginedUpdateContext = React.createContext<
  React.Dispatch<Message>
>(undefined as any);
