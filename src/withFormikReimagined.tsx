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
import {
  FormikReimaginedProps,
  OuterFormikReimaginedProps,
} from './types.props';
import isFunction from 'lodash.isfunction';
import { runValidationSchema } from './errors';

/**
 * A public higher-order component to access the imperative API
 */
export function withFormikReimagined<
  OuterProps extends OuterFormikReimaginedProps<Values, OtherKeys>,
  Values extends FormikReimaginedValues,
  OtherKeys = never
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
  Values,
  OtherKeys
>): FormikReimaginedComponentDecorator<
  OuterProps,
  OuterProps & FormikReimaginedProps<Values, OtherKeys>
> {
  return function createFormik(
    Component: ComponentClassOrStatelessComponent<
      OuterProps & FormikReimaginedProps<Values, OtherKeys>
    >
  ): React.FunctionComponent<OuterProps> {
    //
    return function FormikReimaginedWrapper(
      props: OuterProps
    ): React.FunctionComponentElement<OuterProps> {
      const [state, dispatch] = React.useReducer<
        React.Reducer<
          FormikReimaginedState<Values, OtherKeys>,
          FormikReimaginedMessage<Values>
        >
      >(
        validate == null && validationSchema == null
          ? formikReimaginedReducer
          : formikReimaginedErrorReducer<Values, OtherKeys>(
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
          onChange(
            state.values,
            state.errors != null && state.errors.size > 0
              ? state.errors
              : undefined
          );
        }
      }, [state, onChange]);

      React.useEffect(() => {
        if (onError) {
          onError(state.errors);
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
        },
        []
      );

      const injectedformikProps: FormikReimaginedHelpers &
        FormikReimaginedHandlers &
        FormikReimaginedState<Values, OtherKeys> = {
        setFieldValue: setFieldValue,
        handleChange: handleChange,
        handleSubmit: handleSubmit,
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
