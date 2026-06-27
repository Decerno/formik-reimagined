import React from 'react';
import {
  FormikReimaginedStateContext,
  FormikReimaginedUpdateContext,
} from './FormikContext';
import { Message } from './reducer';
import { ArrayHelpers } from './types.array';
import { FieldArrayAllProps } from './types.props';
import { FormikReimaginedErrors } from 'types';

/**
 * this implementation is not lazy enough
 */
export class FieldArrayHelper<Value>
  implements Omit<ArrayHelpers<Value>, 'errors'> {
  /**
   *
   */
  constructor(
    private dispatch: { (value: Message): void },
    private name: string
  ) {}

  push = (value: Value) =>
    this.dispatch({ type: 'PUSH_A', payload: { field: this.name, value } });

  handlePush = (value: Value) => () => this.push(value);

  swap = (indexA: number, indexB: number) =>
    this.dispatch({
      type: 'SWAP_A',
      payload: { field: this.name, indexA, indexB },
    });

  handleSwap = (indexA: number, indexB: number) => () =>
    this.swap(indexA, indexB);

  move = (from: number, to: number) =>
    this.dispatch({ type: 'MOVE_A', payload: { field: this.name, from, to } });

  handleMove = (from: number, to: number) => () => this.move(from, to);

  insert = (index: number, value: Value) =>
    this.dispatch({
      type: 'INSERT_A',
      payload: { field: this.name, index, value },
    });

  handleInsert = (index: number, value: Value) => () =>
    this.insert(index, value);

  replace = (index: number, value: Value) =>
    this.dispatch({
      type: 'REPLACE_A',
      payload: { field: this.name, index, value },
    });

  handleReplace = (index: number, value: Value) => () =>
    this.replace(index, value);

  unshift = (value: Value) =>
    this.dispatch({ type: 'UNSHIFT_A', payload: { field: this.name, value } });

  handleUnshift = (value: Value) => () => this.unshift(value);

  remove = (index: number) =>
    this.dispatch({ type: 'REMOVE_A', payload: { field: this.name, index } });

  handleRemove = (index: number) => () => this.remove(index);

  pop = () =>
    this.dispatch({ type: 'POP_A', payload: { field: this.name } });

  handlePop = () => () => this.pop();
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
      readonly errors: FormikReimaginedErrors | undefined;
      /**
       * Update State
       */
      dispatch(value: Message): void;
    }
): React.ReactElement | null {
  const arrayHelpers = new FieldArrayHelper<Value>(props.dispatch, props.name);

  const { component, render, children, errors } = props;
  const getErrors = React.useCallback(
    (i: number) => {
      const prefix = props.name + '[' + i + '].';
      const keyMap = Array.from(errors?.entries() || []).filter(kv =>
        kv[0].startsWith(prefix)
      );
      return new Map(keyMap.map(kv => [kv[0].substr(prefix.length), kv[1]]));
    },
    [errors]
  );
  const fprops: ArrayHelpers<Value> & { name: string } = {
    errors: getErrors,
    ...arrayHelpers,
    name: props.name,
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
  }): React.ReactElement | null {
  const rawState = React.useContext(FormikReimaginedStateContext);
  const dispatch = React.useContext(FormikReimaginedUpdateContext);

  const state: any[] = (rawState.values as any)[name];
  if (state === undefined) {
    throw new Error(
      `Missing state value for state named '${name}' in nested '${JSON.stringify(
        rawState.values
      )}'`
    );
  }
  return (
    <FieldArrayState
      {...props}
      state={state}
      errors={rawState.errors}
      name={name}
      dispatch={dispatch}
    >
      {children}
    </FieldArrayState>
  );
}
