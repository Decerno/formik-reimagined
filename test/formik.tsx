import {
  FormikReimaginedValues,
  FormikReimaginedHelpers,
  FormikReimaginedHandlers,
  FormikReimaginedState,
  withFormikReimagined,
  FormikReimaginedErrors,
  FormikReimaginedConfig,
} from '../src';
import React from 'react';
import isFunction from 'lodash.isfunction';

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

function FormikInner<
  Values extends FormikReimaginedValues = FormikReimaginedValues
>(
  props: FormikReimaginedConfig<Values> & {
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
