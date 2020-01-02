import {
  FormikReimaginedValues,
  FormikReimaginedProps,
  FormikReimaginedHelpers,
  FormikReimaginedHandlers,
  FormikReimaginedState,
  withFormikReimagined,
  FormikReimaginedErrors,
} from '../src';
import React from 'react';
import isFunction from 'lodash.isfunction';

export interface FormikReimaginedConfig<Values> {
  /**
   * Form component to render
   */
  component?:
    | React.ComponentType<FormikReimaginedProps<Values>>
    | React.ReactNode;

  /**
   * React children or child render callback
   */
  children?:
    | ((props: FormikReimaginedProps<Values>) => React.ReactNode)
    | React.ReactNode;
  /** */
  initialValues: Values;

  /**
   * A Yup Schema
   */
  validationSchema?: any;

  /**
   * Validation function. Must return an error object where that object keys map to corresponding value.
   */
  validate?: (values: Values) => void | object;
}

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

function FormikInner<
  Values extends FormikReimaginedValues = FormikReimaginedValues,
  ExtraProps = {}
>(
  props: FormikReimaginedConfig<Values> &
    ExtraProps & {
      values: Values;
      errors: FormikReimaginedErrors<Values>;
      setFieldValue(field: string, value: any): void;
      /** Classic React change handler, keyed by input name */
      handleChange(e: React.ChangeEvent<any>): void;
    }
) {
  const { component, children, ...oprops } = props as any;

  const injectedformikProps: FormikReimaginedHelpers &
    FormikReimaginedHandlers<any> &
    FormikReimaginedState<any> = {
    setFieldValue: props.setFieldValue,
    handleChange: props.handleChange,
    values: props.values,
    errors: props.errors,
  };
  const formikbag = { ...oprops, ...injectedformikProps };
  return component
    ? React.createElement(component as any, formikbag)
    : children // children come last, always called
    ? isFunction(children)
      ? (children as (bag: any) => React.ReactNode)(formikbag)
      : !isEmptyChildren(children)
      ? React.Children.only(children)
      : null
    : null;
}

export const Formik = withFormikReimagined<
  {
    initialValues: any;
  },
  any
>({
  mapPropsToValues: props => props.initialValues,
})(FormikInner);
