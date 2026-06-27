import { FormikReimaginedState, FormikReimaginedErrors } from './types';
import { swap, move, insert, replace, copyArray } from './arrayUtils';
import { runValidationSchema, runValidateHandler } from './errors';
import { setIn } from './pathUtils';
import { ObjectSchema } from 'yup';

export type BaseMessage =
  | { type: 'SET_ERRORS'; payload: FormikReimaginedErrors }
  | { type: 'REPLACE_ERRORS'; payload: FormikReimaginedErrors }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; message?: string } }
  | {
      type: 'SET_FIELD_VALUE';
      payload: { field: string; value?: any; resetInitialValues?: boolean };
    }
  | { type: 'SET_TOUCHED'; payload: { field: string } }
  | {
      type: 'SET_FIELD_TOUCHED';
      payload: { field: string; touched: boolean };
    }
  | {
      type: 'SET_VALUES';
      payload: { values: any; resetInitialValues?: boolean };
    }
  | { type: 'SET_STATUS'; payload: { status?: any } }
  | { type: 'SET_SUBMITTING'; payload: { isSubmitting: boolean } }
  | { type: 'SET_VALIDATING'; payload: { isValidating: boolean } }
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'RESET_FORM'; payload: { values: any } }
  | { type: 'PUSH_A'; payload: { field: string; value?: any } }
  | {
      type: 'SWAP_A';
      payload: { field: string; indexA: number; indexB: number };
    }
  | { type: 'MOVE_A'; payload: { field: string; from: number; to: number } }
  | { type: 'INSERT_A'; payload: { field: string; index: number; value?: any } }
  | {
      type: 'REPLACE_A';
      payload: { field: string; index: number; value?: any };
    }
  | { type: 'UNSHIFT_A'; payload: { field: string; value?: any } }
  | { type: 'POP_A'; payload: { field: string } }
  | { type: 'REMOVE_A'; payload: { field: string; index: number } }
  | {
      type: 'FLIP_CB';
      payload: { field: string; checked: boolean; value: any };
    };

export type Message = BaseMessage;
/** Return the next value for a checkbox */
function getValueForCheckbox(
  currentValue: string | any[],
  checked: boolean,
  valueProp: any
) {
  // eslint-disable-next-line eqeqeq
  if (valueProp == 'true' || valueProp == 'false') {
    return !!checked;
  }

  if (checked && valueProp) {
    return Array.isArray(currentValue)
      ? currentValue.concat(valueProp)
      : [valueProp];
  }
  if (!Array.isArray(currentValue)) {
    return !currentValue;
  }
  const index = currentValue.indexOf(valueProp);
  if (index < 0) {
    return currentValue;
  }
  return currentValue.slice(0, index).concat(currentValue.slice(index + 1));
}
// State reducer
export function formikReimaginedReducer<Values extends object>(
  state: FormikReimaginedState<Values>,
  msg: Message
) {
  switch (msg.type) {
    case 'SET_ERRORS': {
      return {
        ...state,
        errors: aggregate([msg.payload, state.errors]),
        errorsSet: true,
      };
    }
    case 'REPLACE_ERRORS': {
      return {
        ...state,
        errors: new Map(msg.payload),
        errorsSet: true,
      };
    }
    case 'SET_TOUCHED': {
      return {
        ...state,
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    }
    case 'SET_FIELD_TOUCHED': {
      const touched = { ...state.touched };
      if (msg.payload.touched) {
        touched[msg.payload.field] = true;
      } else {
        delete touched[msg.payload.field];
      }
      return {
        ...state,
        touched,
      };
    }
    case 'SET_FIELD_ERROR': {
      const errors = new Map(state.errors);
      if (msg.payload.message === undefined) {
        errors.delete(msg.payload.field);
      } else {
        errors.set(msg.payload.field, msg.payload.message);
      }
      return {
        ...state,
        errors,
        errorsSet: true,
      };
    }
    case 'SET_STATUS': {
      return {
        ...state,
        status: msg.payload.status,
      };
    }
    case 'SET_SUBMITTING': {
      return {
        ...state,
        isSubmitting: msg.payload.isSubmitting,
      };
    }
    case 'SET_VALIDATING': {
      return {
        ...state,
        isValidating: msg.payload.isValidating,
      };
    }
    case 'SUBMIT_ATTEMPT': {
      return {
        ...state,
        submitCount: (state.submitCount || 0) + 1,
        isSubmitting: true,
      };
    }
    case 'RESET_FORM': {
      return setValuesAndTouched(state, msg.payload.values, true);
    }
    case 'SET_FIELD_VALUE': {
      const values: any = setIn(
        state.values as any,
        msg.payload.field,
        msg.payload.value
      );
      return setValuesAndTouched(
        state,
        values,
        msg.payload.resetInitialValues || false
      );
    }
    case 'SET_VALUES': {
      return setValuesAndTouched(
        state,
        {
          ...state.values,
          ...msg.payload.values,
        },
        msg.payload.resetInitialValues || false
      );
    }
    case 'FLIP_CB': {
      const field = msg.payload.field;
      const values: any = {
        ...(state.values as any),
        [field]: getValueForCheckbox(
          (state.values as any)[field],
          msg.payload.checked,
          msg.payload.value
        ),
      };
      return setValuesAndTouched(state, values, false);
    }
    case 'PUSH_A': {
      const field = msg.payload.field;
      const values: any = {
        ...(state.values as any),
        [field]: [...(state.values as any)[field], msg.payload.value],
      };
      return setValuesAndTouched(state, values, false);
    }
    case 'SWAP_A': {
      const field = msg.payload.field;
      const values: any = {
        ...(state.values as any),
        [field]: swap(
          (state.values as any)[field],
          msg.payload.indexA,
          msg.payload.indexB
        ),
      };
      return setValuesAndTouched(state, values, false);
    }
    case 'MOVE_A': {
      const field = msg.payload.field;
      const values: any = {
        ...(state.values as any),
        [field]: move(
          (state.values as any)[field],
          msg.payload.from,
          msg.payload.to
        ),
      };
      return setValuesAndTouched(state, values, false);
    }
    case 'INSERT_A': {
      const field = msg.payload.field;
      const values: any = {
        ...(state.values as any),
        [field]: insert(
          (state.values as any)[field],
          msg.payload.index,
          msg.payload.value
        ),
      };
      return setValuesAndTouched(state, values, false);
    }
    case 'REPLACE_A': {
      const field = msg.payload.field;
      const values: any = {
        ...(state.values as any),
        [field]: replace(
          (state.values as any)[field],
          msg.payload.index,
          msg.payload.value
        ),
      };
      return setValuesAndTouched(state, values, false);
    }
    case 'UNSHIFT_A': {
      const field = msg.payload.field;
      const currentArray = (state.values as any)[field];
      const values: any = {
        ...(state.values as any),
        [field]: currentArray
          ? [msg.payload.value, ...currentArray]
          : [msg.payload.value],
      };
      return setValuesAndTouched(state, values, false);
    }
    case 'REMOVE_A': {
      const field = msg.payload.field;
      const currentArray = (state.values as any)[field];
      const copy = currentArray ? copyArray(currentArray) : [];
      copy.splice(msg.payload.index, 1);
      const values: any = { ...(state.values as any), [field]: copy };
      return setValuesAndTouched(state, values, false);
    }
    case 'POP_A': {
      const field = msg.payload.field;
      const currentArray = (state.values as any)[field];
      const copy = currentArray ? copyArray(currentArray) : [];
      copy.pop();
      const values: any = { ...(state.values as any), [field]: copy };
      return setValuesAndTouched(state, values, false);
    }
    default:
      return state;
  }
}

/**
 * Returns state with replaced values and touched
 * touched is a new object with all the changed property values compared to initial values set to true.
 *
 * For instance:
 * initalValues: `{ "a":1, "b":2 }`
 * values: `{ "a":10, "b":2 }`
 * becomes
 * `{ "a":true }`
 */
function setValuesAndTouched<Values extends object>(
  state: FormikReimaginedState<Values>,
  values: Values,
  resetInitialValues: boolean
): FormikReimaginedState<Values> {
  const initialValues = resetInitialValues ? values : state.initialValues;
  const touched: { [field: string]: boolean } = resetInitialValues
    ? {}
    : Object.keys(values).reduce((prev, c) => {
        const valueEquals =
          (values as any)[c] === (initialValues as any)[c] ||
          JSON.stringify((values as any)[c]) ===
            JSON.stringify((initialValues as any)[c]);
        if (!valueEquals) {
          prev[c] = true;
        }
        return prev;
      }, {} as any);
  return {
    ...state,
    touched,
    values,
    initialValues,
  };
}

/** */
function aggregate<T, V>(maps: Map<T, V>[]) {
  return new Map(
    maps
      .map(m => Array.from(m.entries()))
      .reduce((acc, entries) => acc.concat(entries), [] as [T, V][])
  );
}

export function formikReimaginedErrorReducer<Values extends object>(
  validationSchema: ObjectSchema<Values> | undefined,
  validate:
    | { (values: Values, field?: string): FormikReimaginedErrors }
    | undefined
) {
  return function formikReimaginedErrorReducer(
    state: FormikReimaginedState<Values>,
    msg: Message
  ) {
    // Newly introduced meta / explicit-error messages must not trigger a full
    // re-validation: doing so would either clobber explicitly set errors or
    // waste work on submit/status/touched-only changes. Original message types
    // (SET_ERRORS, SET_TOUCHED, value/array updates) keep their behavior.
    const skipRevalidation =
      msg.type === 'REPLACE_ERRORS' ||
      msg.type === 'SET_FIELD_ERROR' ||
      msg.type === 'SET_STATUS' ||
      msg.type === 'SET_SUBMITTING' ||
      msg.type === 'SET_VALIDATING' ||
      msg.type === 'SUBMIT_ATTEMPT' ||
      msg.type === 'SET_FIELD_TOUCHED';

    const nextState =
      msg.type === 'SET_ERRORS' ? state : formikReimaginedReducer(state, msg);

    if (skipRevalidation) {
      return formikReimaginedReducer(state, msg);
    }

    const errors: FormikReimaginedErrors[] = [];
    if (validationSchema) {
      errors.push(runValidationSchema(validationSchema, nextState.values));
    }
    if (validate) {
      errors.push(runValidateHandler(validate, nextState.values));
    }
    if (msg.type === 'SET_ERRORS') {
      errors.push(msg.payload);
    }
    return {
      ...nextState,
      errors: aggregate(errors),
      errorsSet: msg.type === 'SET_ERRORS',
    };
  };
}
