import * as React from 'react';
import {
  FormikReimaginedHelpers,
  FormikReimaginedProps,
  FormikReimaginedValues,
  FormikReimaginedHandlers,
  FormikReimaginedState,
} from './types';
import { executeChangeMsg } from './handleChange';
import {
  FormikReimaginedValueContext,
  FormikReimaginedUpdateContext,
} from './FormikContext';
import {
  formikReimaginedReducer,
  FormikReimaginedMessage,
  formikReimaginedErrorReducer,
} from './reducer';

/**
 * withFormik() configuration options. Backwards compatible.
 */
export interface WithFormikReimaginedConfig<
  Props,
  Values extends FormikReimaginedValues = FormikReimaginedValues
> {
  /**
   * Map props to the form values
   */
  mapPropsToValues?: (props: Props) => Values;

  /**
   * A Yup Schema
   */
  validationSchema?: any;

  /**
   * Validation function. Must return an error object where that object keys map to corresponding value.
   */
  validate?: (values: Values) => void | object;
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
  },
  validate,
  validationSchema,
}: WithFormikReimaginedConfig<OuterProps, Values>): ComponentDecorator<
  OuterProps,
  OuterProps & FormikReimaginedProps<Values>
> {
  return function createFormik(
    Component: CompositeComponent<OuterProps & FormikReimaginedProps<Values>>
  ): React.FunctionComponent<OuterProps> {
    //
    return function CWrapped(
      props: OuterProps
    ): React.FunctionComponentElement<OuterProps> {
      if (!validationSchema) {
        validationSchema = (props as any).validationSchema;
      }
      if (!validate) {
        validate = (props as any).validate;
      }
      const [state, dispatch] = React.useReducer<
        React.Reducer<
          FormikReimaginedState<Values>,
          FormikReimaginedMessage<Values>
        >
      >(
        validate == null && validationSchema == null
          ? formikReimaginedReducer
          : formikReimaginedErrorReducer(validationSchema, validate),
        {
          values: mapPropsToValues(props),
          errors: new Map(),
        }
      );
      const p = props as any;
      const onChange = p.onChange;
      React.useEffect(() => {
        if (onChange) {
          onChange(state.values);
        }
      }, [state, onChange]);

      const { children, ...oprops } = props as any;
      const setFieldValue = React.useCallback(
        (field: string, value: any) => {
          dispatch({
            type: 'SET_FIELD_VALUE',
            payload: {
              field,
              value,
            },
          });
        },
        [dispatch]
      );
      const handleChange=React.useCallback((e1: React.ChangeEvent<any>) => {
        const msg = executeChangeMsg(e1);
        if (msg!=null){
          dispatch(msg);
        }
      },[dispatch]);

      const injectedformikProps: FormikReimaginedHelpers &
        FormikReimaginedHandlers<any> &
        FormikReimaginedState<any> = {
        setFieldValue: setFieldValue,
        handleChange: handleChange,
        values: state.values,
        errors: state.errors,
      };
      return (
        <FormikReimaginedValueContext.Provider value={state.values}>
          <FormikReimaginedUpdateContext.Provider value={dispatch}>
            <Component {...oprops} {...injectedformikProps}>
              {children}
            </Component>
          </FormikReimaginedUpdateContext.Provider>
        </FormikReimaginedValueContext.Provider>
      );
    };
  };
}
