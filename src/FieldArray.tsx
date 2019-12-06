import React from 'react';
import { SharedProps, ArrayHelpers } from './types';
import { swap, move, insert, replace, copyArray } from './arrayUtils';

/**
 * 
 */
export class FieldArrayHelper<Value> implements ArrayHelpers<Value>{
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
export interface FieldArrayRenderProps<Value> extends ArrayHelpers<Value>{
  
}
export type FieldArrayProps<Value>= SharedProps<FieldArrayRenderProps<Value>,ReadonlyArray<Value>>;

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

/**
 * "Field array" implemented using state instead of React.useReducer 
 */
export class FieldArray<P,Value> extends React.PureComponent<P & FieldArrayProps<Value>,ReadonlyArray<Value>> {
  constructor(props:P & FieldArrayProps<Value>) {
    super(props);
    if (props.value!=null){
      this.state = props.value;
    }else{
      this.state = []
    }
  }

  render() {
    const arrayHelpers: ArrayHelpers<Value>=new FieldArrayHelper<Value>(next=>{
      this.setState(next);
      if (this.props.onChange) {
        this.props.onChange(next);
      }
    },this.state);

    const {
      component,
      render,
      children,
    } = this.props;

    const props: FieldArrayRenderProps<Value> = {
      ...arrayHelpers
    };

    return component
      ? React.createElement(component as any, props)
      : render
      ? (render as any)(props)
      : children // children come last, always called
      ? typeof children === 'function'
        ? (children as any)(props)
        : !isEmptyChildren(children)
        ? React.Children.only(children)
        : null
      : null;
  }
}