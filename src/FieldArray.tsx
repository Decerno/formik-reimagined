import React from 'react';

export interface ArrayHelpers<Value> {
  /** Imperatively add a value to the end of an array */
  push: (obj: Value) => void;
  /** Imperatively swap two values in an array */
  swap: (indexA: number, indexB: number) => void;
  /** Imperatively move an element in an array to another index */
  move: (from: number, to: number) => void;
  /** Imperatively insert an element at a given index into the array */
  insert: (index: number, value: Value) => void;
  /** Imperatively replace a value at an index of an array  */
  replace: (index: number, value: Value) => void;
  unshift: (value: Value) => number;
  /** Imperatively remove and element at an index of an array */
  remove(index: number): Value | undefined;
}

/**
 * Some array helpers!
 */
export const move = (array: ReadonlyArray<any>, from: number, to: number) => {
  const copy = copyArray(array);
  const value = copy[from];
  copy.splice(from, 1);
  copy.splice(to, 0, value);
  return copy;
};

export const swap = (
  arrayLike: ReadonlyArray<any>,
  indexA: number,
  indexB: number
) => {
  const copy = copyArray(arrayLike);
  const a = copy[indexA];
  copy[indexA] = copy[indexB];
  copy[indexB] = a;
  return copy;
};

export const insert = (
  arrayLike: ReadonlyArray<any>,
  index: number,
  value: any
) => {
  const copy = copyArray(arrayLike);
  copy.splice(index, 0, value);
  return copy;
};

export const replace = (
  arrayLike: ReadonlyArray<any>,
  index: number,
  value: any
) => {
  const copy = copyArray(arrayLike);
  copy[index] = value;
  return copy;
};

const copyArray = (arrayLike: ReadonlyArray<any>): any[] => {
  if (!arrayLike) {
    return [];
  } else if (Array.isArray(arrayLike)) {
    return [...arrayLike];
  } else {
    throw new Error('Not an array');
  }
};

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
    // We need to make sure we also remove relevant pieces of `touched` and `errors`
    let result: any;
    this.updateArrayField(
      // so this gets call 3 times
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
export interface SharedRenderProps<T> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: string | React.ComponentType<T | void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: (props: T) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: (props: T) => React.ReactNode;
}
export interface FieldArrayRenderProps<Value> extends ArrayHelpers<Value>{
}

/** @private Does a React component have exactly 0 children? */
export const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

export class FieldArrayState<P,Value> extends React.Component<P & SharedRenderProps<FieldArrayRenderProps<Value>>,ReadonlyArray<Value>> {
  constructor(props:P) {
    super(props);
  }

  render() {
    const arrayHelpers: ArrayHelpers<Value>=new FieldArrayHelper<Value>(next=>this.setState(next),this.state);

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