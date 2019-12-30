import {
  FormikReimaginedValues,
  FormikReimaginedProps,
  FormikReimaginedHelpers,
  FormikReimaginedHandlers,
  FormikReimaginedState,
  withFormikReimagined,
} from '../src';
import React from 'react';
import isFunction from 'lodash.isfunction';
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

function FormikInner<
  Values extends FormikReimaginedValues = FormikReimaginedValues,
  ExtraProps = {}
>(props: FormikReimaginedConfig<Values> & ExtraProps & {values:Values; setFieldValue(field: string, value: any): void;}) {

  const { component, children, ...oprops } = props as any;

  const injectedformikProps: FormikReimaginedHelpers &
    FormikReimaginedHandlers &
    FormikReimaginedState<any> = {
    setFieldValue: props.setFieldValue,
    handleChange: (_: React.ChangeEvent<any>) => {
      throw new Error('not impl');
    },
    values: props.values,
  };
  const formikbag = {...oprops, ...injectedformikProps};
  return (
      component
        ? React.createElement(component as any, formikbag)
        : children // children come last, always called
        ? isFunction(children)
          ? (children as (bag: any) => React.ReactNode)(formikbag)
          : !isEmptyChildren(children)
          ? React.Children.only(children)
          : null
        : null
  );
}
export const Formik = withFormikReimagined<{ initialValues:any, setState(v:any):void },any>({
  mapPropsToValues:(props)=>props.initialValues,
  onChange:(state, props)=>{ if (props.setState) props.setState(state) }
})(FormikInner);
