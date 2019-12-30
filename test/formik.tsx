import {
  FormikReimaginedValues,
  FormikReimaginedProps,
  FormikReimaginedProvider,
  FormikReimaginedHelpers,
  FormikReimaginedHandlers,
  FormikReimaginedState,
} from '../src';
import React from 'react';
import isFunction from 'lodash.isfunction';
import { Initial } from '@hookstate/initial';
import { useStateLink } from '@hookstate/core';
import R from 'ramda';
interface FormikReimaginedConfig<Values> {
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
  initialValues: Values;
}
/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

export function Formik<
  Values extends FormikReimaginedValues = FormikReimaginedValues,
  ExtraProps = {}
>(props: FormikReimaginedConfig<Values> & ExtraProps) {
    // TODO: use withFormikReimagined
  const state = useStateLink(props.initialValues).with(Initial);

  const { component, children, ...oprops } = props as any;
  const setFieldValue = React.useCallback(
    (field: string, value: any) => {
      const next = R.set(R.lensProp(field), value, state.value);
      state.set(next);
    },
    [state]
  );
  const injectedformikProps: FormikReimaginedHelpers &
    FormikReimaginedHandlers &
    FormikReimaginedState<any> = {
    setFieldValue: setFieldValue,
    handleChange: (_: React.ChangeEvent<any>) => {
      throw new Error('not impl');
    },
    state: state,
    values: state.value,
  };
  const formikbag = {...oprops, ...injectedformikProps};
  return (
    <FormikReimaginedProvider value={{ state: state }}>
      {component
        ? React.createElement(component as any, formikbag)
        : children // children come last, always called
        ? isFunction(children)
          ? (children as (bag: any) => React.ReactNode)(formikbag)
          : !isEmptyChildren(children)
          ? React.Children.only(children)
          : null
        : null}
    </FormikReimaginedProvider>
  );
}
