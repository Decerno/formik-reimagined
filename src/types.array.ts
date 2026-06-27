import { FormikReimaginedErrors } from './types';

/**
 *
 */
export interface ArrayHelpers<Value> {
  /** Imperatively add a value to the end of an array */
  push: (obj: Value) => void;
  /** Curried handler that adds a value to the end of an array */
  handlePush: (obj: Value) => () => void;
  /** Imperatively swap two values in an array */
  swap: (indexA: number, indexB: number) => void;
  /** Curried handler that swaps two values in an array */
  handleSwap: (indexA: number, indexB: number) => () => void;
  /** Imperatively move an element in an array to another index */
  move: (from: number, to: number) => void;
  /** Curried handler that moves an element in an array to another index */
  handleMove: (from: number, to: number) => () => void;
  /** Imperatively insert an element at a given index into the array */
  insert: (index: number, value: Value) => void;
  /** Curried handler that inserts an element at a given index into the array */
  handleInsert: (index: number, value: Value) => () => void;
  /** Imperatively replace a value at an index of an array  */
  replace: (index: number, value: Value) => void;
  /** Curried handler that replaces a value at an index of an array */
  handleReplace: (index: number, value: Value) => () => void;
  /** Imperatively add an element to the beginning of an array */
  unshift: (value: Value) => void;
  /** Curried handler that adds an element to the beginning of an array */
  handleUnshift: (value: Value) => () => void;
  /** Imperatively remove and element at an index of an array */
  remove(index: number): void;
  /** Curried handler that removes an element at an index of an array */
  handleRemove: (index: number) => () => void;
  /** Imperatively remove the last element of the array */
  pop(): void;
  /** Curried handler that removes the last element of the array */
  handlePop: () => () => void;
  /** Get row errors */
  errors(index: number): FormikReimaginedErrors;
}

/**
 * Render props for a field array, mirroring Formik's `FieldArrayRenderProps`.
 * Includes the array helpers plus the field `name`.
 */
export type FieldArrayRenderProps<Value> = ArrayHelpers<Value> & {
  /** Name (path) of the array field */
  name: string;
};
