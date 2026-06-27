/**
 * Attribution: portions of this file are adapted from Formik (MIT License,
 * Copyright (c) 2020 Jared Palmer), https://github.com/formium/formik.
 *
 * Similarities to Formik's public code:
 * - The `isEmptyChildren` helper and the `component` / `render` / `children`
 *   rendering convention in `renderField` mirror Formik's `Field` / `FieldArray`
 *   (see `formik/src/Field.tsx` and `formik/src/FieldArray.tsx`). The same
 *   pattern is already used in this repository's `FieldArray.tsx` and
 *   `formik.ts`.
 * - `FastField`'s memo boundary that re-renders only when the field's own slice
 *   changes is adapted from Formik's `FastField` `shouldComponentUpdate`
 *   optimization (see `formik/src/FastField.tsx`).
 *
 * See the "Attribution" section of the README for details.
 */
import * as React from 'react';
import {
  FormikReimaginedStateContext,
  FormikReimaginedUpdateContext,
} from './FormikContext';
import { executeChangeMsg } from './handleChange';
import { Message } from './reducer';
import { FieldAllProps, FieldRenderProps, FormikReimaginedSharedProps } from './types.props';

/** @private Does a React component have exactly 0 children? */
const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

/**
 * Render a field using the `component`, `render` or `children` convention
 * shared with `FieldArray`.
 */
function renderField<Value>(
  fprops: FieldRenderProps<Value>,
  config: FormikReimaginedSharedProps<FieldRenderProps<Value>>
): React.ReactElement | null {
  const { component, render, children } = config;
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

/**
 * Build the stable `onChange` / `setValue` helpers for a field.
 */
function useFieldHelpers<Value>(
  name: string,
  dispatch: (value: Message) => void
): Pick<FieldRenderProps<Value>, 'onChange' | 'setValue'> {
  const onChange = React.useCallback(
    (e: React.ChangeEvent<any>) => {
      const msg = executeChangeMsg(e);
      if (msg != null) {
        dispatch(msg);
      }
    },
    [dispatch]
  );
  const setValue = React.useCallback(
    (value: Value) => {
      dispatch({ type: 'SET_FIELD_VALUE', payload: { field: name, value } });
    },
    [dispatch, name]
  );
  return { onChange, setValue };
}

/**
 * `Field` binds a single value of the form to an input.
 *
 * This is the simple, correct-but-not-optimized variant: it consumes the whole
 * form state, so it re-renders whenever the form state changes. For a field
 * that only re-renders when its own slice changes, use `FastField`.
 */
export function Field<Value = any>({
  name,
  ...config
}: FieldAllProps<Value>): React.ReactElement | null {
  const state = React.useContext(FormikReimaginedStateContext);
  const dispatch = React.useContext(FormikReimaginedUpdateContext);
  const { onChange, setValue } = useFieldHelpers<Value>(name, dispatch);

  const fprops: FieldRenderProps<Value> = {
    name,
    value: (state.values as any)[name],
    error: state.errors?.get(name),
    touched: !!(state.touched as any)[name],
    onChange,
    setValue,
  };
  return renderField(fprops, config);
}

type FastFieldInnerProps<Value> = FieldRenderProps<Value> &
  FormikReimaginedSharedProps<FieldRenderProps<Value>>;

/**
 * Memoized rendering boundary for `FastField`.
 *
 * The custom comparator only looks at the field's own slice (`name`, `value`,
 * `error`, `touched`). Changes to `component` / `render` / `children` identity
 * are intentionally ignored — mirroring Formik's `FastField`
 * `shouldComponentUpdate` behaviour — so an unrelated field update will not
 * re-render this field.
 */
const FastFieldInner = React.memo(
  function FastFieldInner<Value>(
    props: FastFieldInnerProps<Value>
  ): React.ReactElement | null {
    const { name, value, error, touched, onChange, setValue, ...config } =
      props;
    return renderField<Value>(
      { name, value, error, touched, onChange, setValue },
      config
    );
  },
  (prev, next) =>
    prev.name === next.name &&
    prev.value === next.value &&
    prev.error === next.error &&
    prev.touched === next.touched
) as <Value>(props: FastFieldInnerProps<Value>) => React.ReactElement | null;

/**
 * `FastField` is a performance-optimized variant of `Field`.
 *
 * It subscribes only to its own slice of the form state (`values[name]`,
 * `errors.get(name)`, `touched[name]`) and wraps rendering in a memo boundary,
 * so it does not re-render when an unrelated field changes.
 *
 * Slight alteration from Formik: there is no per-field `validate` function and
 * no isolated per-field form state — validation stays centralized in the
 * reducer / validation-schema model used by this fork.
 */
export function FastField<Value = any>({
  name,
  ...config
}: FieldAllProps<Value>): React.ReactElement | null {
  const state = React.useContext(FormikReimaginedStateContext);
  const dispatch = React.useContext(FormikReimaginedUpdateContext);
  const { onChange, setValue } = useFieldHelpers<Value>(name, dispatch);

  return (
    <FastFieldInner<Value>
      name={name}
      value={(state.values as any)[name]}
      error={state.errors?.get(name)}
      touched={!!(state.touched as any)[name]}
      onChange={onChange}
      setValue={setValue}
      {...config}
    />
  );
}
