import * as React from 'react';
import {
  FormikReimaginedHelpers,
  FormikReimaginedValues,
  FormikReimaginedHandlers,
  FormikReimaginedState,
  ComponentClassOrStatelessComponent,
  FormikReimaginedComponentDecorator,
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
import { WithFormikReimaginedConfig } from './types.config';
import { FormikReimaginedProps } from './types.props';
import isFunction from 'lodash.isfunction';
import { runValidationSchema } from './errors';

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
        Object.prototype.hasOwnProperty.call(vanillaProps, k) &&
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
}: WithFormikReimaginedConfig<
  OuterProps,
  Values
>): FormikReimaginedComponentDecorator<
  OuterProps,
  OuterProps & FormikReimaginedProps<Values>
> {
  return function createFormik(
    Component: ComponentClassOrStatelessComponent<
      OuterProps & FormikReimaginedProps<Values>
    >
  ): React.FunctionComponent<OuterProps> {
    //
    return function CWrapped(
      props: OuterProps
    ): React.FunctionComponentElement<OuterProps> {
      if (!validationSchema) {
        // NOTE: Used for testing
        validationSchema = (props as any).validationSchema;
      }
      if (!validate) {
        // NOTE: Used for testing
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
          : formikReimaginedErrorReducer(
              validationSchema!=null && !isFunction(validationSchema) ? validationSchema : undefined,
              validate
            ),
        {
          values: mapPropsToValues(props),
          errors: new Map(),
        }
      );
      const p = props as any;
      const onChange = p.onChange;

      React.useEffect(() => {
        if (isFunction(validationSchema) && !state.errorsSet) {
          const schema = validationSchema(props);
          const errors = runValidationSchema(schema, state.values);
          dispatch({
            type: 'SET_ERRORS',
            payload: errors,
          });
        }
      }, [state, props]);

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
      const handleChange = React.useCallback(
        (e1: React.ChangeEvent<any>) => {
          const msg = executeChangeMsg(e1);
          if (msg != null) {
            dispatch(msg);
          }
        },
        [dispatch]
      );

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
