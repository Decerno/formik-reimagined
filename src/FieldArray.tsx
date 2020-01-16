import React from 'react';
import {
  FormikReimaginedValueContext,
  FormikReimaginedUpdateContext,
} from './FormikContext';
import * as R from 'ramda';
import { Message } from './reducer';
import { ArrayHelpers } from './types.array';
import { FormikReimaginedSharedProps } from './types.props';

/**
 * this implementation is not lazy enough
 */
export class FieldArrayHelper<Value> implements ArrayHelpers<Value> {
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
export interface FieldArrayRenderProps<Value> extends ArrayHelpers<Value> {}
export type FieldArrayProps<Value> = FormikReimaginedSharedProps<
  FieldArrayRenderProps<Value>
>;

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

/**
 * "Field array" implemented using state instead of React.useReducer
 */
export function FieldArrayState<P, Value>(
  props: P &
    FieldArrayProps<Value> & {
      /**
       * State
       */
      readonly state: readonly Value[];
      /**
       * Name of state to update
       */
      readonly name: string;
      /**
       * Update State
       */
      dispatch(value: Message<Value[]>): void;
    }
): React.FunctionComponentElement<P> {
  const arrayHelpers: ArrayHelpers<Value> = new FieldArrayHelper<Value>(
    props.dispatch,
    props.name
  );

  const { component, render, children } = props;

  const fprops: FieldArrayRenderProps<Value> = {
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
  FieldArrayProps<Value> & {
    readonly name: string;
  }): React.FunctionComponentElement<P> {
  const values = React.useContext(FormikReimaginedValueContext);
  const dispatch = React.useContext(FormikReimaginedUpdateContext);

  const state: any[] = R.view(R.lensProp(name), values);
  if (state === undefined) {
    throw new Error(
      `Missing state value for state named '${name}' in nested '${JSON.stringify(
        values
      )}'`
    );
  }
  return (
    <FieldArrayState {...props} state={state} name={name} dispatch={dispatch}>
      {children}
    </FieldArrayState>
  );
}
