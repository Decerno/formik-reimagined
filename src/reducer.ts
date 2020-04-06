import { FormikReimaginedState, FormikReimaginedErrors } from './types';
import * as R from 'ramda';
import { swap, move, insert, replace, copyArray } from './arrayUtils';
import { runValidationSchema, runValidateHandler } from './errors';
import { ObjectSchema } from 'yup';

export type BaseMessage =
  | { type: 'SET_ERRORS'; payload: FormikReimaginedErrors }
  | { type: 'SET_FIELD_VALUE'; payload: { field: string; value?: any } }
  | { type: 'SET_TOUCHED'; payload: { field: string } }
  | { type: 'SET_VALUES'; payload: any }
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
export function formikReimaginedReducer<Values>(
  state: FormikReimaginedState<Values>,
  msg: Message
) {
  switch (msg.type) {
    case 'SET_ERRORS':
      return {
        ...state,
        errors: aggregate([msg.payload, state.errors]),
        errorsSet: true,
      };
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: R.set(
          R.lensProp(msg.payload.field),
          msg.payload.value,
          state.values
        ),
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    case 'SET_VALUES':
      return {
        ...state,
        values: msg.payload,
        touched: { ...state.touched, ...(fieldsWithBooleanTrue(msg.payload)) },
      };
    case 'FLIP_CB':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          value =>
            getValueForCheckbox(value, msg.payload.checked, msg.payload.value),
          state.values
        ),
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    case 'PUSH_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          arrayLike => [...arrayLike, msg.payload.value],
          state.values
        ),
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    case 'SWAP_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          arrayLike => swap(arrayLike, msg.payload.indexA, msg.payload.indexB),
          state.values
        ),
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    case 'MOVE_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          arrayLike => move(arrayLike, msg.payload.from, msg.payload.to),
          state.values
        ),
      };
    case 'INSERT_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          arrayLike => insert(arrayLike, msg.payload.index, msg.payload.value),
          state.values
        ),
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    case 'REPLACE_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          arrayLike => replace(arrayLike, msg.payload.index, msg.payload.value),
          state.values
        ),
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    case 'UNSHIFT_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          array =>
            array ? [msg.payload.value, ...array] : [msg.payload.value],
          state.values
        ),
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    case 'REMOVE_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          array => {
            const copy = array ? copyArray(array) : [];
            copy.splice(msg.payload.index, 1);
            return copy;
          },
          state.values
        ),
        touched: { ...state.touched, [msg.payload.field]: true },
      };
    default:
      return state;
  }
}
/**
 * You get a new object with all the property values set to true.
 *
 * For instance:
 * `{ "a":1, "b":2 }`
 * becomes
 * `{ "a":true, "b":true}`
*/
function fieldsWithBooleanTrue(payload: any) {
  return Object.keys(payload).reduce(((prev, c) => { prev[c] = true; return prev; }), {} as any);
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
    const nextState =
      msg.type === 'SET_ERRORS' ? state : formikReimaginedReducer(state, msg);
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
