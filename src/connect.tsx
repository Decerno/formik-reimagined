import * as React from 'react';
import { useFormikReimaginedContext } from './useFormikReimaginedContext';
import { FormikReimaginedProps } from './types.props';

/**
 * Props injected by {@link connect}: the current Formik bag under `formik`.
 */
export interface WithFormikReimaginedContext<Values = any> {
  formik: FormikReimaginedProps<Values>;
}

/**
 * A `connect`-equivalent HOC that injects the Formik bag as a `formik` prop,
 * analogous to Formik's `connect`.
 */
export function connect<OwnProps extends object, Values = any>(
  Component: React.ComponentType<OwnProps & WithFormikReimaginedContext<Values>>
): React.FunctionComponent<OwnProps> {
  const C: React.FunctionComponent<OwnProps> = (props: OwnProps) => {
    const formik = useFormikReimaginedContext<any>();
    return React.createElement(Component as any, { ...props, formik });
  };
  C.displayName = `FormikReimaginedConnect(${
    Component.displayName || Component.name || 'Component'
  })`;
  return C;
}
