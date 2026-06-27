import * as React from 'react';
import { useFormikReimaginedContext } from './useFormikReimaginedContext';
import { getIn } from './pathUtils';

/**
 * Field metadata, mirroring (a subset of) Formik's `FieldMetaProps`.
 */
export interface FieldReimaginedMetaProps {
  /** Current value of the field */
  value: any;
  /** Error message for the field, if any */
  error?: string;
  /** Whether the field has been touched */
  touched: boolean;
  /** Initial value of the field */
  initialValue: any;
}

/**
 * Field input props, mirroring Formik's `FieldInputProps`.
 */
export interface FieldReimaginedInputProps {
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
}

/**
 * Render props passed to `Field`'s render/children function.
 */
export interface FieldReimaginedRenderProps {
  field: FieldReimaginedInputProps;
  meta: FieldReimaginedMetaProps;
  form: ReturnType<typeof useFormikReimaginedContext>;
}

export interface FieldReimaginedProps {
  /** Name (path) of the field */
  name: string;
  /** Component to render. Defaults to `input`. */
  component?: string | React.ComponentType<any>;
  /** Render prop */
  render?: (props: FieldReimaginedRenderProps) => React.ReactNode;
  /** Children render function or nodes */
  children?:
    | ((props: FieldReimaginedRenderProps) => React.ReactNode)
    | React.ReactNode;
  /** Any other props are forwarded to the rendered input/component */
  [key: string]: any;
}

/**
 * A `Field`-equivalent that wires `value`/`onChange`/`onBlur` to the form and
 * exposes `field`/`meta`/`form` to render props. Errors are read from the
 * internal error `Map` by field path.
 */
export function Field({
  name,
  component,
  render,
  children,
  ...rest
}: FieldReimaginedProps): React.ReactElement | null {
  const form = useFormikReimaginedContext();

  const field: FieldReimaginedInputProps = {
    name,
    value: getIn(form.values, name),
    onChange: form.handleChange,
    onBlur: form.handleBlur,
  };

  const meta: FieldReimaginedMetaProps = {
    value: getIn(form.values, name),
    error: form.errors.get(name),
    touched: !!form.touched[name],
    initialValue: getIn(form.initialValues, name),
  };

  if (render) {
    return render({ field, meta, form }) as React.ReactElement;
  }

  if (typeof children === 'function') {
    return (children as (props: FieldReimaginedRenderProps) => React.ReactNode)({
      field,
      meta,
      form,
    }) as React.ReactElement;
  }

  const Comp: any = component || 'input';
  if (typeof Comp === 'string') {
    return React.createElement(Comp, { ...rest, ...field }, children as any);
  }
  return React.createElement(
    Comp,
    { ...rest, field, meta, form },
    children as any
  );
}
