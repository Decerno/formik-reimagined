import * as React from 'react';
import isFunction from 'lodash.isfunction';
import {
  FormikReimaginedStateContext,
  FormikReimaginedUpdateContext,
  FormikReimaginedBagContext,
} from './FormikContext';
import {
  useFormikReimagined,
  UseFormikReimaginedConfig,
} from './useFormikReimagined';
import { FormikReimaginedValues } from './types';
import { FormikReimaginedProps } from './types.props';

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

export interface FormikReimaginedProviderProps<
  Values extends FormikReimaginedValues = FormikReimaginedValues
> extends UseFormikReimaginedConfig<any, Values> {
  /** Component to render, receives the formik bag as props */
  component?: React.ComponentType<FormikReimaginedProps<Values>>;
  /** Render prop */
  render?: (props: FormikReimaginedProps<Values>) => React.ReactNode;
  /** Children render function or nodes */
  children?:
    | ((props: FormikReimaginedProps<Values>) => React.ReactNode)
    | React.ReactNode;
}

/**
 * A self contained provider component, analogous to Formik's `<Formik>`.
 * It owns the form state via {@link useFormikReimagined}, exposes it through
 * context (so `Field`, `Form`, `ErrorMessage`, `FieldArray` and
 * `useFormikReimaginedContext` work), and renders via `component`, `render` or
 * a child render function.
 */
export function FormikReimaginedProvider<
  Values extends FormikReimaginedValues = FormikReimaginedValues
>(props: FormikReimaginedProviderProps<Values>): React.ReactElement | null {
  const {
    component,
    render,
    children,
    initialValues,
    validate,
    validationSchema,
    onChange,
    onError,
    onSubmit,
    onTouched,
    props: outerProps,
  } = props;

  const bag = useFormikReimagined<any, Values>({
    initialValues,
    validate,
    validationSchema,
    onChange,
    onError,
    onSubmit,
    onTouched,
    props: outerProps,
  });

  const { state, dispatch, ...injected } = bag;
  const formikBag = injected as FormikReimaginedProps<Values>;

  const content = component
    ? React.createElement(component as any, formikBag)
    : render
    ? render(formikBag)
    : children
    ? isFunction(children)
      ? (children as (bag: FormikReimaginedProps<Values>) => React.ReactNode)(
          formikBag
        )
      : !isEmptyChildren(children)
      ? React.Children.only(children)
      : null
    : null;

  return (
    <FormikReimaginedStateContext.Provider value={state}>
      <FormikReimaginedUpdateContext.Provider value={dispatch}>
        <FormikReimaginedBagContext.Provider value={injected}>
          {content as any}
        </FormikReimaginedBagContext.Provider>
      </FormikReimaginedUpdateContext.Provider>
    </FormikReimaginedStateContext.Provider>
  );
}
