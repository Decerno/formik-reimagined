import isFunction from 'lodash.isfunction';
import * as React from 'react';
import { runValidationSchema } from './errors';
import {
  FormikReimaginedStateContext,
  FormikReimaginedUpdateContext,
} from './FormikContext';
import { executeChangeMsg } from './handleChange';
import {
  formikReimaginedErrorReducer,
  formikReimaginedReducer,
  Message,
} from './reducer';
import {
  ComponentClassOrStatelessComponent,
  FormikReimaginedComponentDecorator,
  FormikReimaginedErrors,
  FormikReimaginedHandlers,
  FormikReimaginedHelpers,
  FormikReimaginedState,
  FormikReimaginedValues,
  FormikReimaginedTouched,
} from './types';
import { WithFormikReimaginedConfig } from './types.config';
import {
  FormikReimaginedCallbacks,
  FormikReimaginedProps,
} from './types.props';

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
  OuterProps & FormikReimaginedCallbacks<OuterProps, Values>,
  OuterProps & FormikReimaginedProps<Values>
> {
  return function createFormik(
    Component: ComponentClassOrStatelessComponent<
      OuterProps &
        FormikReimaginedProps<Values> &
        FormikReimaginedCallbacks<OuterProps, Values>
    >
  ): React.FunctionComponent<
    OuterProps & FormikReimaginedCallbacks<OuterProps, Values>
  > {
    //
    return function CWrapped(
      props: OuterProps & FormikReimaginedCallbacks<OuterProps, Values>
    ): React.FunctionComponentElement<OuterProps> {
      const reducer =
        validate == null && validationSchema == null
          ? formikReimaginedReducer
          : formikReimaginedErrorReducer(
              validationSchema != null && !isFunction(validationSchema)
                ? validationSchema
                : undefined,
              validate
            );
      const initialValues = mapPropsToValues(props);
      const [state, dispatch] = React.useReducer<
        React.Reducer<FormikReimaginedState<Values>, Message>
      >(reducer, {
        values: initialValues,
        errors:
          validationSchema != null && !isFunction(validationSchema)
            ? runValidationSchema(validationSchema, initialValues)
            : new Map(),
        touched: {},
      });
      const { onChange, onError, onSubmit, onTouched } = props;
      const { children, ...outerProps } = props as any;

      React.useEffect(() => {
        if (isFunction(validationSchema) && !(state as any).errorsSet) {
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
          onChange(state.values, yieldErrorsOrUndefined<Values>(state));
        }
      }, [state, onChange]);

      React.useEffect(() => {
        if (onError) {
          onError(yieldErrorsOrUndefined<Values>(state));
        }
      }, [state, onError]);

      React.useEffect(() => {
        if (onTouched) {
          onTouched(state.touched as FormikReimaginedTouched);
        }
      }, [state.touched, onTouched]);

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
      const setValues = React.useCallback(
        (values: Values) => {
          dispatch({
            type: 'SET_VALUES',
            payload: values,
          });
        },
        [dispatch]
      );
      const setTouched = React.useCallback(
        (field: string) => {
          dispatch({
            type: 'SET_TOUCHED',
            payload: {
              field,
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
      const submitForm = React.useCallback(
        (_e?: React.FormEvent<any> | undefined) => {
          if (yieldErrorsOrUndefined<Values>(state) == null) {
            if (onSubmit) {
              onSubmit(state.values, {
                setFieldValue,
                setValues,
                setTouched,
                props: outerProps,
              });
            }
          }
        },
        [onSubmit, state, setFieldValue, setTouched, setValues, outerProps]
      );
      const injectedformikProps: FormikReimaginedHelpers<Values> &
        FormikReimaginedHandlers &
        FormikReimaginedState<Values> = {
        setFieldValue,
        setValues,
        setTouched,
        handleChange,
        submitForm,
        values: state.values,
        errors: state.errors,
        touched: state.touched,
      };
      return (
        <FormikReimaginedStateContext.Provider value={state}>
          <FormikReimaginedUpdateContext.Provider value={dispatch}>
            <Component {...outerProps} {...injectedformikProps}>
              {children}
            </Component>
          </FormikReimaginedUpdateContext.Provider>
        </FormikReimaginedStateContext.Provider>
      );
    };
  };
}
function yieldErrorsOrUndefined<Values extends FormikReimaginedValues>(
  state: FormikReimaginedState<Values>
): FormikReimaginedErrors | undefined {
  return state.errors != null && state.errors.size > 0
    ? state.errors
    : undefined;
}
