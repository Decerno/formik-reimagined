import { FormikReimaginedState } from './types';
import * as R from 'ramda';
import { swap, move, insert, replace, copyArray } from './arrayUtils';

export type FormikReimaginedMessage<Values> =
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
  | { type: 'REMOVE_A'; payload: { field: string; index: number } };

// State reducer
export function formikReimaginedReducer<Values>(
  state: FormikReimaginedState<Values>,
  msg: FormikReimaginedMessage<Values>
) {
  switch (msg.type) {
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
