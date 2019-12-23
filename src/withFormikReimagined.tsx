import * as React from 'react';
import {
  FormikReimaginedHelpers,
  FormikReimaginedProps,
  FormikReimaginedValues,
  FormikReimaginedHandlers,
  FormikReimaginedState,
} from './types';
import _ from 'lodash';
import R from 'ramda';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { executeChange } from './handleChange';
import { useStateLink, StateLink, StateMemo } from '@hookstate/core';
import { Initial } from '@hookstate/initial';
/**
 * Formik actions + { props }
 */
export type FormikBag<P> = { props: P } & FormikReimaginedHelpers;

/**
 * withFormik() configuration options. Backwards compatible.
 */
export interface WithFormikConfig<
  Props,
  Values extends FormikReimaginedValues = FormikReimaginedValues
> {
  /**
   * Set the display name of the component. Useful for React DevTools.
   */
  displayName?: string;

  /**
   * Submission handler
   */
  handleSubmit: (values: Values, formikBag: FormikBag<Props>) => void;

  /**
   * Map props to the form values
   */
  mapPropsToValues?: (props: Props) => Values;

  /**
   * A Yup Schema or a function that returns a Yup schema
   */
  validationSchema?: any | ((props: Props) => any);

  /**
   * Validation function. Must return an error object or promise that
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (values: Values, props: Props) => void | object | Promise<any>;
}

export type CompositeComponent<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;

export interface ComponentDecorator<TOwnProps, TMergedProps> {
  (component: CompositeComponent<TMergedProps>): React.ComponentType<TOwnProps>;
}

export interface InferableComponentDecorator<TOwnProps> {
  <T extends CompositeComponent<TOwnProps>>(component: T): T;
}

/**
 * A public higher-order component to access the imperative API
 */
export function withFormikReimagined<
  OuterProps extends object,
  Values extends FormikReimaginedValues
>({
  mapPropsToValues = (vanillaProps: OuterProps): Values => {
    let val: Values = {} as Values;
    for (let k in vanillaProps) {
      if (
        vanillaProps.hasOwnProperty(k) &&
        typeof vanillaProps[k] !== 'function'
      ) {
        // @todo TypeScript fix
        (val as any)[k] = vanillaProps[k];
      }
    }
    return val as Values;
  }
}: WithFormikConfig<OuterProps, Values>): ComponentDecorator<
  OuterProps,
  OuterProps & FormikReimaginedProps<Values>
> {

  return function createFormik(
    Component: CompositeComponent<OuterProps & FormikReimaginedProps<Values>>
  ): React.FunctionComponent<OuterProps> { //
    return function C(props:(OuterProps)) : React.FunctionComponentElement<OuterProps>{
        const [state,setState] = React.useState(mapPropsToValues(props));
          //useStateLink(mapPropsToValues(this.props)).with(Initial);
        const { children, ...oprops } = props as any;
        const setFieldValue = (field:string,value:any)=>{
          setState(R.set(R.lensProp(field), value, state.get()));
        };
        const injectedformikProps: FormikReimaginedHelpers & FormikReimaginedHandlers& FormikReimaginedState<any>={
          setFieldValue: setFieldValue,
          handleChange: (e1:React.ChangeEvent<any>)=>{
            executeChange(state.get(), setFieldValue, e1);
          },
          values:state
        };
        return (
          <Component {...oprops} {...injectedformikProps} >
              {children}
          </Component>
        );
      }
    }
}
