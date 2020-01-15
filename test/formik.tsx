import {
  FormikReimaginedValues,
  FormikReimaginedHelpers,
  FormikReimaginedHandlers,
  FormikReimaginedState,
  FormikReimaginedErrors,
  FormikReimaginedConfig,
} from '../src';
import React from 'react';
import isFunction from 'lodash.isfunction';

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

export function FormikTestComponent<
  Values extends FormikReimaginedValues = FormikReimaginedValues,
  OtherKeys = never
>(
  props: FormikReimaginedConfig<Values, OtherKeys> &
    FormikReimaginedHandlers &
    FormikReimaginedHelpers & {
      values: Values;
      errors: FormikReimaginedErrors<Values, OtherKeys>;
    }
) {
  const { component, children, ...oprops } = props as any;

  const injectedformikProps: FormikReimaginedHelpers &
    FormikReimaginedHandlers &
    FormikReimaginedState<Values, OtherKeys> = {
    setFieldValue: props.setFieldValue,
    handleChange: props.handleChange,
    handleSubmit: props.handleSubmit,
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
