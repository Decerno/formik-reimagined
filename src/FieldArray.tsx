import React from 'react';
import {
  FormikReimaginedStateContext,
  FormikReimaginedUpdateContext,
} from './FormikContext';
import * as R from 'ramda';
import { Message } from './reducer';
import { ArrayHelpers } from './types.array';
import { FieldArrayAllProps } from './types.props';
import { FormikReimaginedErrors } from 'types';

/**
 * this implementation is not lazy enough
 */
export class FieldArrayHelper<Value> implements Omit<ArrayHelpers<Value>,'errors'> {
  /**
   *
   */
  constructor(
    private dispatch: { (value: Message<Value[]>): void },
    private name: string
  ) {}

  push = (value: Value) =>
    this.dispatch({ type: 'PUSH_A', payload: { field: this.name, value } });

  swap = (indexA: number, indexB: number) =>
    this.dispatch({
      type: 'SWAP_A',
      payload: { field: this.name, indexA, indexB },
    });

  move = (from: number, to: number) =>
    this.dispatch({ type: 'MOVE_A', payload: { field: this.name, from, to } });

  insert = (index: number, value: Value) =>
    this.dispatch({
      type: 'INSERT_A',
      payload: { field: this.name, index, value },
    });

  replace = (index: number, value: Value) =>
    this.dispatch({
      type: 'REPLACE_A',
      payload: { field: this.name, index, value },
    });

  unshift = (value: Value) =>
    this.dispatch({ type: 'UNSHIFT_A', payload: { field: this.name, value } });

  remove = (index: number) =>
    this.dispatch({ type: 'REMOVE_A', payload: { field: this.name, index } });
}

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

/**
 * "Field array" implemented using state instead of React.useReducer
 */
export function FieldArrayState<P, Value>(
  props: P &
    FieldArrayAllProps<Value> & {
      /**
       * State
       */
      readonly state: readonly Value[];
      /**
       * Name of state to update
       */
      readonly name: string;
      /**
       * Name of state to update
       */
      readonly errors: FormikReimaginedErrors|undefined;
      /**
       * Update State
       */
      dispatch(value: Message<Value[]>): void;
    }
): React.FunctionComponentElement<P> {
  const arrayHelpers = new FieldArrayHelper<Value>(
    props.dispatch,
    props.name
  );

  const { component, render, children, errors } = props;
  const getErrors = React.useCallback((i:number)=>{
    const prefix = props.name+"["+i+"].";
    const keyMap =  Array.from(errors?.entries()||[]).filter(kv=>kv[0].startsWith(prefix));
    return new Map(keyMap.map(kv=> [kv[0].substr(prefix.length), kv[1]] ));
  },[errors]);
  const fprops: ArrayHelpers<Value> = {
    errors:getErrors,
    ...arrayHelpers,
  };

  return component
    ? React.createElement(component as any, fprops)
    : render
    ? (render as any)(fprops)
    : children // children come last, always called
    ? typeof children === 'function'
      ? (children as any)(fprops)
      : !isEmptyChildren(children)
      ? React.Children.only(children)
      : null
    : null;
}
export function FieldArray<P, Value>({
  children,
  name,
  ...props
}: P &
  FieldArrayAllProps<Value> & {
    readonly name: string;
  }): React.FunctionComponentElement<P> {
  const rawState = React.useContext(FormikReimaginedStateContext);
  const dispatch = React.useContext(FormikReimaginedUpdateContext);

  const state: any[] = R.view(R.lensProp(name), rawState.values);
  if (state === undefined) {
    throw new Error(
      `Missing state value for state named '${name}' in nested '${JSON.stringify(
        rawState.values
      )}'`
    );
  }
  return (
    <FieldArrayState {...props} state={state} errors={rawState.errors} name={name} dispatch={dispatch}>
      {children}
    </FieldArrayState>
  );
}
