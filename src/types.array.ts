import { FormikReimaginedErrors } from './types';

/**
 *
 */
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
  unshift: (value: Value) => void;
  /** Imperatively remove and element at an index of an array */
  remove(index: number): void;
  /** Get row errors */
  errors(index: number): FormikReimaginedErrors
}
