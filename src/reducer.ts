import { FormikReimaginedState, FormikReimaginedErrors } from './types';
import * as R from 'ramda';
import { swap, move, insert, replace, copyArray } from './arrayUtils';
import { runValidationSchema, runValidateHandler } from './errors';
import { ObjectSchema } from 'yup';

export type FormikReimaginedBaseMessage<Values> =
  | { type: 'SET_ERRORS'; payload: FormikReimaginedErrors<Values> }
  | { type: 'SET_VALUES'; payload: Values }
  | { type: 'SET_FIELD_VALUE'; payload: { field: string; value?: any } }
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

export type FormikReimaginedMessage<Values> = FormikReimaginedBaseMessage<
  Values
>;
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
  msg: FormikReimaginedMessage<Values>
) {
  switch (msg.type) {
    case 'SET_ERRORS':
      return { ...state, errors: msg.payload, errorsSet:true };
    case 'SET_VALUES':
      return { ...state, values: msg.payload };
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: R.set(
          R.lensProp(msg.payload.field),
          msg.payload.value,
          state.values
        ),
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
      };
    case 'PUSH_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          arrayLike => [...arrayLike, msg.payload.value],
          state.values
        ),
      };
    case 'SWAP_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          arrayLike => swap(arrayLike, msg.payload.indexA, msg.payload.indexB),
          state.values
        ),
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
      };
    case 'REPLACE_A':
      return {
        ...state,
        values: R.over(
          R.lensProp(msg.payload.field),
          arrayLike => replace(arrayLike, msg.payload.index, msg.payload.value),
          state.values
        ),
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
      };
    default:
      return state;
  }
}

export function formikReimaginedErrorReducer<Values extends object>(
  validationSchema: ObjectSchema<Values> | undefined,
  validate:
    | { (values: Values, field?: string): FormikReimaginedErrors<Values> }
    | undefined
) {
  return function formikReimaginedErrorReducer(
    state: FormikReimaginedState<Values>,
    msg: FormikReimaginedMessage<Values>
  ) {
    const nextState = formikReimaginedReducer(state, msg);
    const errors: FormikReimaginedErrors<Values>[] = [];
    if (validationSchema) {
      errors.push(runValidationSchema(validationSchema, nextState.values));
    }
    if (validate) {
      errors.push(runValidateHandler(validate, nextState.values));
    }
    var errorEntries = errors
      .map(m => Array.from(m.entries()))
      .reduce(
        (acc, entries) => acc.concat(entries),
        [] as [keyof Values, string][]
      );
    return { values: nextState.values, errors: new Map(errorEntries) };
  };
}
