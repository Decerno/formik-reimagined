import React from 'react';
import { FormikReimaginedSharedProps, FormikReimaginedArrayHelpers } from './types';
import { swap, move, insert, replace, copyArray } from './arrayUtils';
import { FormikReimaginedValueContext, FormikReimaginedUpdateContext } from './FormikContext';
import R from 'ramda';

/**
 * this implementation is not lazy enough
 */
export class FieldArrayHelper<Value> implements FormikReimaginedArrayHelpers<Value> {
    /**
   *
   */
  constructor(private onChange:{(next:ReadonlyArray<Value>):void},private state:ReadonlyArray<Value>) {
  }
  private updateArrayField = (
    fn: { (s:ReadonlyArray<Value>):ReadonlyArray<Value> }
  ) => {
    this.onChange(fn(this.state))
  };

  push = (value: Value) =>
    this.updateArrayField(
      (arrayLike: ReadonlyArray<Value>) => [
        ...arrayLike,
        value,
      ],
    );

  swap = (indexA: number, indexB: number) =>
    this.updateArrayField(
      (array: ReadonlyArray<Value>) => swap(array, indexA, indexB)
    );

  move = (from: number, to: number) =>
    this.updateArrayField((array: ReadonlyArray<Value>) => move(array, from, to));

  insert = (index: number, value: Value) =>
    this.updateArrayField(
      (array: ReadonlyArray<Value>) => insert(array, index, value)
    );

  replace = (index: number, value: Value) =>
    this.updateArrayField(
      (array: ReadonlyArray<Value>) => replace(array, index, value)
    );

  unshift = (value: Value) => {
    let length = -1;
    this.updateArrayField(
      (array: ReadonlyArray<Value>) => {
        const arr = array ? [value, ...array] : [value];
        if (length < 0) {
          length = arr.length;
        }
        return arr;
      }
    );
    return length;
  };

  remove= (index: number): Value => {
    let result: any;
    this.updateArrayField(
      (array?: ReadonlyArray<any>) => {
        const copy = array ? copyArray(array) : [];
        if (!result) {
          result = copy[index];
        }
        copy.splice(index, 1);
        return copy;
      }
    );

    return result;
  }

}
export interface FieldArrayRenderProps<Value> extends FormikReimaginedArrayHelpers<Value> {}
export type FieldArrayProps<Value> = FormikReimaginedSharedProps<FieldArrayRenderProps<Value>, ReadonlyArray<Value>>;

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean => React.Children.count(children) === 0;

/**
 * "Field array" implemented using state instead of React.useReducer
 */
export function FieldArrayState<P, Value>(props: P & FieldArrayProps<Value> & {
  /**
  * State
  */
 state: readonly Value [];
 /**
  * Update State
  */
 setState(value:readonly Value []): void;
}): React.FunctionComponentElement<P> {

  const arrayHelpers: FormikReimaginedArrayHelpers<Value> = new FieldArrayHelper<Value>(props.setState, props.state);

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
export function FieldArray<P, Value>({children, name, ...props}: P & FieldArrayProps<Value> & { readonly name:string; }): React.FunctionComponentElement<P> {
  const values = React.useContext(FormikReimaginedValueContext);
  const dispatch = React.useContext(FormikReimaginedUpdateContext);
  const setFieldValue = React.useCallback( (value: any) => {
    dispatch({
      type: 'SET_FIELD_VALUE',
      payload: {
        field:name,
        value,
      },
    });
  },[dispatch]);

  const state: any[] = R.view(R.lensProp(name), values);
  if (state===undefined){
    throw new Error(`Missing state value for state named '${name}' in nested '${JSON.stringify(values)}'`);
  }
  return <FieldArrayState {...props} state={state} setState={setFieldValue} >{children}</FieldArrayState>;
}