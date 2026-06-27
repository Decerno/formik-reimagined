# Formik reimagined

Formik inspired API

## Why

We have used Formik to render a huge form with hundreds of fields in many subcomponents. The performance impact of Formik validation and submit caused degraded user experience.

In order to get around these issues we decided to make a Formik fork compatible with the parts of the Formik API that is relevant in the application.

## Current subset of Formik

- `FieldArray ( arrayHelper )` : note that the return values are removed, instead the helper methods send events to the internal reducer
- `Field` & `FastField` : implemented with a slightly altered API (see below)
- `withFormik` -> `withFormikReimagined`
- `Formik` -> `FormikReimagined` : note that the initial values and default functions differ from regular Formik
- The error API is slightly different in order to be able to use a Map (to get better performance)

We have implemented the subset of [Formik 2.1.1](https://github.com/formium/formik/releases/tag/v2.1.1) that we used in the application.

## `Field` & `FastField`

`Field` and `FastField` bind a single value of the form to an input using the
same `component` / `render` / `children` render-prop convention as `FieldArray`.
They inject a small prop bag: `name`, `value`, `error` (looked up from the error
`Map`), `touched`, an `onChange` change handler, and a `setValue` helper.

- `Field` is the simple variant. It consumes the whole form state, so it
  re-renders whenever the form state changes.
- `FastField` is the performance-optimized variant. It subscribes only to its
  own slice (`values[name]`, `errors.get(name)`, `touched[name]`) and is wrapped
  in a memo boundary, so it does not re-render when an unrelated field changes.

The API is slightly altered compared to Formik. The following Formik field
features are intentionally dropped:

- No per-field `validate` function and no isolated per-field form state —
  validation stays centralized in the reducer / validation-schema model this
  fork already uses.
- No `as` prop; use `component` / `render` / `children` instead.
- No nested-path (`a.b[0].c`) `name` handling — `name` maps directly to a top
  level key of the form values.

## Attribution

This library is a fork that is, in large parts, based on
[Formik](https://github.com/formium/formik) by Jared Palmer, which is
distributed under the MIT License. Several modules intentionally mirror or
adapt Formik's public source code:

- `src/handleChange.ts` and `src/reducer.ts` — the change-event handling
  (`executeChangeMsg` / `getSelectedValues`) and the `getValueForCheckbox`
  logic are adapted from Formik's `Formik.tsx` / `handleChange` implementation.
- `src/arrayUtils.ts` and `src/FieldArray.tsx` — the array helpers and the
  `component` / `render` / `children` rendering convention are adapted from
  Formik's `FieldArray.tsx`.
- `src/Field.tsx` — `Field` and `FastField` reuse Formik's
  `component` / `render` / `children` rendering convention and the
  `isEmptyChildren` helper, and `FastField`'s slice-based memoization is
  adapted from Formik's `FastField` `shouldComponentUpdate` optimization.
- `src/errors.ts` — `yupToFormErrors` mirrors Formik's Yup error mapping.

The APIs have been altered for this fork (see the sections above), but the
above modules retain enough structural similarity to Formik that attribution is
warranted. Formik's MIT license terms are compatible with this project's MIT
license; see the upstream
[Formik LICENSE](https://github.com/formium/formik/blob/master/LICENSE) for the
full text.

## Lessons learned

Some of the lessons learned from this fork can be moved over to Formik with some minor breaking changes to the procedural API.
