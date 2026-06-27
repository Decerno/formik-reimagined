import * as React from 'react';
import { useFormikReimaginedContext } from './useFormikReimaginedContext';

export interface ErrorMessageReimaginedProps {
  /** Name (path) of the field whose error should be shown */
  name: string;
  /** Element/component to wrap the message in (e.g. 'div'). */
  component?: string | React.ComponentType<any>;
  /** Render prop receiving the error message string */
  render?: (message: string) => React.ReactNode;
  /** Children render function receiving the error message string */
  children?: (message: string) => React.ReactNode;
  /** Any other props forwarded to the wrapping component */
  [key: string]: any;
}

/**
 * An `ErrorMessage`-equivalent. Renders the error for a field (read from the
 * internal error `Map`) only when that field has been touched, matching
 * Formik's behavior.
 */
export function ErrorMessage({
  name,
  component,
  render,
  children,
  ...rest
}: ErrorMessageReimaginedProps): React.ReactElement | null {
  const form = useFormikReimaginedContext();
  const error = form.errors.get(name);
  const touched = !!form.touched[name];

  if (!error || !touched) {
    return null;
  }

  if (render) {
    return render(error) as React.ReactElement;
  }
  if (typeof children === 'function') {
    return children(error) as React.ReactElement;
  }
  if (component) {
    return React.createElement(component as any, rest, error);
  }
  return React.createElement(React.Fragment, null, error);
}
