import * as React from 'react';
import {
  FormikReimaginedHelpers,
  FormikReimaginedValues,
  FormikReimaginedHandlers,
  FormikReimaginedState,
  ComponentClassOrStatelessComponent,
  FormikReimaginedComponentDecorator,
  FormikReimaginedErrors,
} from './types';
import { executeChangeMsg } from './handleChange';
import {
  FormikReimaginedStateContext,
  FormikReimaginedUpdateContext,
} from './FormikContext';
import {
  formikReimaginedReducer,
  Message,
  formikReimaginedErrorReducer,
} from './reducer';
import { WithFormikReimaginedConfig } from './types.config';
import {
  FormikReimaginedProps,
  FormikReimaginedCallbacks,
} from './types.props';
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
  OuterProps & FormikReimaginedCallbacks<Values>,
  OuterProps & FormikReimaginedProps<Values>
> {
  return function createFormik(
    Component: ComponentClassOrStatelessComponent<
      OuterProps &
        FormikReimaginedProps<Values> &
        FormikReimaginedCallbacks<Values>
    >
  ): React.FunctionComponent<OuterProps & FormikReimaginedCallbacks<Values>> {
    //
    return function CWrapped(
      props: OuterProps & FormikReimaginedCallbacks<Values>
    ): React.FunctionComponentElement<OuterProps> {
      const [state, dispatch] = React.useReducer<
        React.Reducer<FormikReimaginedState<Values>, Message<Values>>
      >(
        validate == null && validationSchema == null
          ? formikReimaginedReducer
          : formikReimaginedErrorReducer(
              validationSchema != null && !isFunction(validationSchema)
                ? validationSchema
                : undefined,
              validate
            ),
        {
          values: mapPropsToValues(props),
          errors: new Map(),
        }
      );
      const onChange = props.onChange;
      const onError = props.onError;
      const onSubmit = props.onSubmit;

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
      const handleSubmit = React.useCallback(
        (e?: React.FormEvent<HTMLFormElement>) => {
          if (e && e.preventDefault && isFunction(e.preventDefault)) {
            e.preventDefault();
          }

          if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
            e.stopPropagation();
          }
          if (onSubmit && yieldErrorsOrUndefined<Values>(state) == null) {
            onSubmit(state.values, {
              setFieldValue,
            });
          }
        },
        [onSubmit, state, setFieldValue]
      );
      const injectedformikProps: FormikReimaginedHelpers &
        FormikReimaginedHandlers &
        FormikReimaginedState<Values> = {
        setFieldValue,
        handleChange,
        handleSubmit,
        values: state.values,
        errors: state.errors,
      };
      return (
        <FormikReimaginedStateContext.Provider value={state}>
          <FormikReimaginedUpdateContext.Provider value={dispatch}>
            <Component {...oprops} {...injectedformikProps}>
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
):
  | FormikReimaginedErrors
  | undefined {
  return state.errors != null && state.errors.size > 0
    ? state.errors
    : undefined;
}
