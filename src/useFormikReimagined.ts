import isFunction from 'lodash.isfunction';
import * as React from 'react';
import { ObjectSchema } from 'yup';
import {
  runValidationSchema,
  runValidationSchemaAsync,
  runValidateHandlerAsync,
} from './errors';
import { objectToErrors } from './errorObject';
import {
  formikReimaginedErrorReducer,
  formikReimaginedReducer,
  Message,
} from './reducer';
import {
  FormikReimaginedErrors,
  FormikReimaginedState,
  FormikReimaginedValues,
} from './types';
import { executeChangeMsg } from './handleChange';
import { FormikReimaginedConfig } from './types.config';
import {
  FormikReimaginedCallbacks,
  FormikReimaginedProps,
} from './types.props';

/**
 * Configuration accepted by {@link useFormikReimagined}.
 */
export interface UseFormikReimaginedConfig<
  Props,
  Values extends FormikReimaginedValues = FormikReimaginedValues
> extends FormikReimaginedConfig<Props, Values>,
    FormikReimaginedCallbacks<Props, Values> {
  /** Initial form values */
  initialValues: Values;
  /** Outer props, exposed to function `validationSchema` and onSubmit helpers */
  props?: Props;
}

/**
 * The full bag returned by {@link useFormikReimagined}: everything that is
 * injected into a form component, plus the raw reducer `state` and `dispatch`.
 */
export type FormikReimaginedBag<Values> = FormikReimaginedProps<Values> & {
  /** Raw reducer state (internal) */
  state: FormikReimaginedState<Values>;
  /** Raw reducer dispatch (internal) */
  dispatch: React.Dispatch<Message>;
};

function yieldErrorsOrUndefined(
  errors: FormikReimaginedErrors
): FormikReimaginedErrors | undefined {
  return errors != null && errors.size > 0 ? errors : undefined;
}

/**
 * A `useFormik`-style hook that owns the reducer based form state and returns
 * the complete set of values, helpers, handlers and computed props. Both
 * {@link withFormikReimagined} and {@link FormikReimaginedProvider} build on
 * top of this hook so there is a single source of truth.
 */
export function useFormikReimagined<
  Props extends object,
  Values extends FormikReimaginedValues
>(
  config: UseFormikReimaginedConfig<Props, Values>
): FormikReimaginedBag<Values> {
  const { validate, validationSchema, initialValues } = config;
  const outerProps = (config.props || {}) as Props;

  const staticSchema: ObjectSchema<Values> | undefined =
    validationSchema != null && !isFunction(validationSchema)
      ? (validationSchema as ObjectSchema<Values>)
      : undefined;

  const reducer: React.Reducer<FormikReimaginedState<Values>, Message> =
    validate == null && validationSchema == null
      ? formikReimaginedReducer
      : formikReimaginedErrorReducer(staticSchema, validate);

  const [state, dispatch] = React.useReducer(reducer, undefined as any, () => ({
    initialValues,
    values: initialValues,
    errors: staticSchema
      ? runValidationSchema(staticSchema, initialValues)
      : new Map<string, string>(),
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    status: undefined,
  }));

  const { onChange, onError, onSubmit, onTouched } = config;

  // Function based validationSchema is evaluated in an effect.
  React.useEffect(() => {
    if (isFunction(validationSchema) && !(state as any).errorsSet) {
      const schema = (validationSchema as any)(outerProps);
      const errors = runValidationSchema(schema, state.values);
      dispatch({
        type: 'SET_ERRORS',
        payload: errors,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, outerProps]);

  React.useEffect(() => {
    if (onChange) {
      onChange(state.values, yieldErrorsOrUndefined(state.errors));
    }
  }, [state, onChange]);

  React.useEffect(() => {
    if (onError) {
      onError(yieldErrorsOrUndefined(state.errors));
    }
  }, [state, onError]);

  React.useEffect(() => {
    if (onTouched) {
      onTouched(state.touched as any);
    }
  }, [state.touched, onTouched]);

  const setFieldValue = React.useCallback(
    (field: string, value: any, resetInitialValues?: boolean) => {
      dispatch({
        type: 'SET_FIELD_VALUE',
        payload: { field, value, resetInitialValues },
      });
    },
    [dispatch]
  );
  const setValues = React.useCallback(
    (values: Values, resetInitialValues?: boolean) => {
      dispatch({
        type: 'SET_VALUES',
        payload: { values, resetInitialValues },
      });
    },
    [dispatch]
  );
  const setTouched = React.useCallback(
    (field: string) => {
      dispatch({ type: 'SET_TOUCHED', payload: { field } });
    },
    [dispatch]
  );
  const setFieldTouched = React.useCallback(
    (field: string, touched: boolean = true) => {
      dispatch({ type: 'SET_FIELD_TOUCHED', payload: { field, touched } });
    },
    [dispatch]
  );
  const setFieldError = React.useCallback(
    (field: string, message: string | undefined) => {
      dispatch({ type: 'SET_FIELD_ERROR', payload: { field, message } });
    },
    [dispatch]
  );
  const setErrors = React.useCallback(
    (errors: FormikReimaginedErrors | { [field: string]: any }) => {
      const map =
        errors instanceof Map
          ? new Map(errors)
          : objectToErrors(errors as any);
      dispatch({ type: 'REPLACE_ERRORS', payload: map });
    },
    [dispatch]
  );
  const setStatus = React.useCallback(
    (status?: any) => {
      dispatch({ type: 'SET_STATUS', payload: { status } });
    },
    [dispatch]
  );
  const setSubmitting = React.useCallback(
    (isSubmitting: boolean) => {
      dispatch({ type: 'SET_SUBMITTING', payload: { isSubmitting } });
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
  const handleBlur = React.useCallback(
    (e: React.FocusEvent<any>) => {
      const target = e && e.target;
      const field = target ? target.name || target.id : undefined;
      if (field) {
        dispatch({
          type: 'SET_FIELD_TOUCHED',
          payload: { field, touched: true },
        });
      }
    },
    [dispatch]
  );

  // Imperative validation that resolves with the computed error map.
  const computeErrors = React.useCallback(
    async (
      values: Values,
      field?: string
    ): Promise<FormikReimaginedErrors> => {
      const collected: FormikReimaginedErrors[] = [];
      if (staticSchema) {
        collected.push(
          await runValidationSchemaAsync(staticSchema, values, field)
        );
      } else if (isFunction(validationSchema)) {
        const schema = (validationSchema as any)(outerProps);
        collected.push(await runValidationSchemaAsync(schema, values, field));
      }
      if (validate) {
        collected.push(
          await runValidateHandlerAsync(validate as any, values, field)
        );
      }
      const merged = new Map<string, string>();
      for (const m of collected) {
        for (const [k, v] of m.entries()) {
          if (!merged.has(k)) {
            merged.set(k, v);
          }
        }
      }
      return merged;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [staticSchema, validationSchema, validate, outerProps]
  );

  const validateForm = React.useCallback(
    async (values?: Values): Promise<FormikReimaginedErrors> => {
      dispatch({ type: 'SET_VALIDATING', payload: { isValidating: true } });
      const errors = await computeErrors(values || state.values);
      dispatch({ type: 'REPLACE_ERRORS', payload: errors });
      dispatch({ type: 'SET_VALIDATING', payload: { isValidating: false } });
      return errors;
    },
    [computeErrors, state.values]
  );

  const validateField = React.useCallback(
    async (field: string): Promise<FormikReimaginedErrors> => {
      return computeErrors(state.values, field);
    },
    [computeErrors, state.values]
  );

  const resetForm = React.useCallback(
    (nextValues?: Values) => {
      dispatch({
        type: 'RESET_FORM',
        payload: { values: nextValues != null ? nextValues : initialValues },
      });
    },
    [dispatch, initialValues]
  );

  const additionalHelpers = {
    setFieldTouched,
    setFieldError,
    setErrors,
    setStatus,
    setSubmitting,
    resetForm,
    validateForm,
    validateField,
  };

  const submitForm = React.useCallback(
    (e?: React.FormEvent<any>): Promise<void> => {
      if (e && typeof (e as any).preventDefault === 'function') {
        (e as any).preventDefault();
      }
      dispatch({ type: 'SUBMIT_ATTEMPT' });
      const currentErrors = yieldErrorsOrUndefined(state.errors);
      const finish = () =>
        dispatch({ type: 'SET_SUBMITTING', payload: { isSubmitting: false } });
      if (currentErrors == null && onSubmit) {
        const maybe = onSubmit(state.values, {
          setFieldValue,
          setValues,
          setTouched,
          ...additionalHelpers,
          props: outerProps,
        });
        return Promise.resolve(maybe as any).then(finish, finish);
      }
      finish();
      return Promise.resolve();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubmit, state, setFieldValue, setTouched, setValues, outerProps]
  );

  const dirty = React.useMemo(() => {
    return (
      JSON.stringify(state.values) !== JSON.stringify(state.initialValues)
    );
  }, [state.values, state.initialValues]);
  const isValid = state.errors == null || state.errors.size === 0;

  const bag: FormikReimaginedBag<Values> = {
    setFieldValue,
    setValues,
    setTouched,
    ...additionalHelpers,
    handleChange,
    handleBlur,
    submitForm,
    initialValues,
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValidating: state.isValidating,
    status: state.status,
    submitCount: state.submitCount,
    dirty,
    isValid,
    state,
    dispatch,
  };
  return bag;
}
