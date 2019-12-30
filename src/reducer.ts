import { FormikReimaginedState } from "./types";
import R from 'ramda';

export type FormikReimaginedMessage<Values> =
  | { type: 'SET_VALUES'; payload: Values }
  | { type: 'SET_FIELD_VALUE'; payload: { field: string; value?: any } }
  ;

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
        values: R.set(R.lensProp(msg.payload.field), msg.payload.value, state.values)
        //setIn(state.values, msg.payload.field, msg.payload.value),
      };
    default:
      return state;
  }
}