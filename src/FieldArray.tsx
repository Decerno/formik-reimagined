import React from 'react';
import { FormikReimaginedSharedProps, FormikReimaginedArrayHelpers } from './types';
import { swap, move, insert, replace, copyArray } from './arrayUtils';

/**
 * 
 */
export class FieldArrayHelper<Value> implements FormikReimaginedArrayHelpers<Value>{
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
export interface FieldArrayRenderProps<Value> extends FormikReimaginedArrayHelpers<Value>{
  
}
export type FieldArrayProps<Value>= FormikReimaginedSharedProps<FieldArrayRenderProps<Value>,ReadonlyArray<Value>>;

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;


/**
 * "Field array" implemented using state instead of React.useReducer 
 */
export function FieldArray<P,Value>(props:(P & FieldArrayProps<Value>)) : React.FunctionComponentElement<P>{
    const [state, setState] = React.useState((props.value != null?props.value: []) as ReadonlyArray<any>);
    const onSetState = React.useCallback(next=>{
      setState(next);
      if (props.onChange) {
        props.onChange(next);
      }
    },[state])
    const arrayHelpers: FormikReimaginedArrayHelpers<any>=new FieldArrayHelper<any>(onSetState,state);

    const {
      component,
      render,
      children,
    } = props;

    const fprops: FieldArrayRenderProps<any> = {
      ...arrayHelpers
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
};
