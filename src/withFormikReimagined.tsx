import * as React from 'react';
import {
  FormikReimaginedHelpers,
  FormikReimaginedProps,
  FormikReimaginedValues,
  FormikReimaginedHandlers,
  FormikReimaginedState,
} from './types';
import * as R from 'ramda';
import { useStateLink } from '@hookstate/core'
import { Initial } from '@hookstate/initial'
import { executeChange } from './handleChange';

/**
 * withFormik() configuration options. Backwards compatible.
 */
export interface WithFormikReimaginedConfig<Props, Values extends FormikReimaginedValues = FormikReimaginedValues> {
  /**
   * Set the display name of the component. Useful for React DevTools.
   */
  displayName?: string;

  /**
   * Map props to the form values
   */
  mapPropsToValues?: (props: Props) => Values;

  /**
   * A Yup Schema or a function that returns a Yup schema
   */
  validationSchema?: any | ((props: Props) => any);

  onChange?(values: Values): void;
}

export type CompositeComponent<P> = React.ComponentClass<P> | React.StatelessComponent<P>;

export interface ComponentDecorator<TOwnProps, TMergedProps> {
  (component: CompositeComponent<TMergedProps>): React.ComponentType<TOwnProps>;
}

export interface InferableComponentDecorator<TOwnProps> {
  <T extends CompositeComponent<TOwnProps>>(component: T): T;
}

/**
 * A public higher-order component to access the imperative API
 */
export function withFormikReimagined<OuterProps extends object, Values extends FormikReimaginedValues>({
  mapPropsToValues = (vanillaProps: OuterProps): Values => {
    let val: Values = {} as Values;
    for (let k in vanillaProps) {
      if (vanillaProps.hasOwnProperty(k) && typeof vanillaProps[k] !== 'function') {
        // @todo TypeScript fix
        (val as any)[k] = vanillaProps[k];
      }
    }
    return val as Values;
  },
  onChange,
}: WithFormikReimaginedConfig<OuterProps, Values>): ComponentDecorator<
  OuterProps,
  OuterProps & FormikReimaginedProps<Values>
> {
  return function createFormik(
    Component: CompositeComponent<OuterProps & FormikReimaginedProps<Values>>
  ): React.FunctionComponent<OuterProps> {
    //
    return function CWrapped(props: OuterProps): React.FunctionComponentElement<OuterProps> {
      const state= useStateLink(mapPropsToValues(props)).with(Initial);
      const { children, ...oprops } = props as any;
      const setFieldValue = React.useCallback( (field: string, value: any) => {
        const next = R.set(R.lensProp(field), value, state.value);
        state.set(next);
        if (onChange) {
          onChange(next);
        }
      },[state, onChange]);
      const injectedformikProps: FormikReimaginedHelpers & FormikReimaginedHandlers & FormikReimaginedState<any> = {
        setFieldValue: setFieldValue,
        handleChange: (e1: React.ChangeEvent<any>) => {
          executeChange(state, setFieldValue, e1);
        },
        state: state,
      };
      return (
        <Component {...oprops} {...injectedformikProps}>
          {children}
        </Component>
      );
    };
  };
}
