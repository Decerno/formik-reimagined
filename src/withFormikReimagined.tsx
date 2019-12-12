import * as React from 'react';
import {
  FormHelpers,
  FormProps,
  FormValues,
} from './types';
import _ from 'lodash';
import hoistNonReactStatics from 'hoist-non-react-statics';

/**
 * Formik actions + { props }
 */
export type FormikBag<P> = { props: P } & FormHelpers;

/**
 * withFormik() configuration options. Backwards compatible.
 */
export interface WithFormikConfig<
  Props,
  Values extends FormValues = FormValues
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
export function withFormik<
  OuterProps extends object,
  Values extends FormValues
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
  },
  ...config
}: WithFormikConfig<OuterProps, Values>): ComponentDecorator<
  OuterProps,
  OuterProps & FormProps<Values>
> {
  return function createFormik(
    Component: CompositeComponent<OuterProps & FormProps<Values>>
  ): React.ComponentClass<OuterProps> {
    const componentDisplayName =
      Component.displayName ||
      Component.name ||
      (Component.constructor && Component.constructor.name) ||
      'Component';
    class C extends React.Component<OuterProps, {}> {
      static displayName = `WithFormikReimagined(${componentDisplayName})`;
      render() {
        const { children, ...props } = this.props as any;
        const formikProps={};
        return (
            <Component {...props} {...formikProps} >
                {children}
            </Component>
        );
      }
    }

    return hoistNonReactStatics(
      C,
      Component as React.ComponentClass<OuterProps & FormProps<Values>> // cast type to ComponentClass (even if SFC)
    ) as React.ComponentClass<OuterProps>;
  };
}
