# Formik reimagined

Formik inspired API

## Why

We have used Formik to render a huge form with hundreds of fields in many subcomponents. The performance impact of Formik validation and submit caused degraded user experience.

In order to get around these issues we decided to make a Formik fork compatible with the parts of the Formik API that is relevant in the application.

## Current subset of Formik

- `FieldArray ( arrayHelper )` : note that the imperative helper methods send events to the internal reducer
- `withFormik` -> `withFormikReimagined`
- `Formik` -> `FormikReimagined` / `FormikReimaginedProvider` : note that the initial values and default functions differ from regular Formik
- The error API is slightly different in order to be able to use a Map (to get better performance)

We have implemented the subset of [Formik 2.1.1](https://github.com/formium/formik/releases/tag/v2.1.1) that we used in the application, and have since added a Formik 2.4.x–compatible API layer on top of it (see below).

## Formik compatible API layer

A thin, additive compatibility layer is provided so that code written against
modern Formik (2.4.x) compiles with minimal edits, while still using the
Map-based, reducer-driven engine underneath. The original `*Reimagined`
names continue to work unchanged.

### Components, hooks and HOCs

| Formik name         | Reimagined name                  | Notes |
| ------------------- | -------------------------------- | ----- |
| `<Formik>`          | `FormikReimaginedProvider` (also exported as `Formik`) | Self-contained provider with `component`/`render`/children render prop |
| `withFormik`        | `withFormikReimagined` (also `withFormik`) | HOC, state lives here |
| `useFormik`         | `useFormikReimagined` (also `useFormik`) | Returns the full bag |
| `useFormikContext`  | `useFormikReimaginedContext` (also `useFormikContext`) | Reads the bag from context |
| `<Field>`           | `Field`                          | Wires `value`/`onChange`/`onBlur`; exposes `field`/`meta`/`form` |
| `<Form>`            | `Form`                           | `<form>` that calls `submitForm` with `preventDefault` |
| `<ErrorMessage>`    | `ErrorMessage`                   | Reads the error for a field path; shown only when touched |
| `<FieldArray>`      | `FieldArray`                     | See FieldArray helpers below |
| `connect`           | `connect`                        | Injects the bag as a `formik` prop |

### Type aliases

| Formik type     | Reimagined type                                   |
| --------------- | ------------------------------------------------- |
| `FormikProps`   | `FormikReimaginedProps` (also `FormikProps`)       |
| `FormikState`   | `FormikReimaginedState` (also `FormikState`)       |
| `FormikErrors`  | `FormikReimaginedErrors` (also `FormikErrors`) — a `Map`, not a nested object |
| `FormikTouched` | `FormikReimaginedTouched` (also `FormikTouched`)   |
| `FormikConfig`  | `FormikReimaginedConfig` (+ callbacks, also `FormikConfig`) |

### State, helpers and handlers

In addition to the original `values`, `errors`, `touched`, `initialValues`,
`setFieldValue`, `setValues`, `setTouched`, `handleChange` and `submitForm`,
the bag now also exposes the wider Formik surface:

- State: `isSubmitting`, `isValidating`, `status`, `submitCount`, and computed
  `dirty` / `isValid`.
- Helpers: `setFieldTouched`, `setFieldError`, `setErrors`, `setStatus`,
  `setSubmitting`, `resetForm`, `validateForm`, `validateField`.
- Handlers: `handleBlur`.

`submitForm` returns a `Promise`, manages `isSubmitting`/`submitCount`, and runs
`onSubmit` when there are no validation errors.

### Path access and error adapters

- `getIn(obj, path, def?)` / `setIn(obj, path, value)` — dotted and bracket
  path access (`users[0].name`). `setIn` is immutable and is used by the reducer
  so nested field updates work.
- `errorsToObject(map)` / `objectToErrors(obj)` — convert between the internal
  flat error `Map` and a Formik-shaped nested error object.

### FieldArray helpers

`ArrayHelpers` now mirrors Formik more closely: `push`, `swap`, `move`,
`insert`, `replace`, `unshift`, `remove`, `pop`, plus curried event-handler
variants `handlePush`, `handleSwap`, `handleMove`, `handleInsert`,
`handleReplace`, `handleUnshift`, `handleRemove`, `handlePop`. The render props
also include the array `name`, and the reimagined-only `errors(index)` helper is
retained.

## Intentional, irreducible differences

These differences are kept on purpose to preserve the performance
characteristics that motivated the fork:

- **Errors are a `Map<string, string>`** keyed by field path, not a nested
  object. Use `errorsToObject` when a nested object is required.
- **`<Formik>` / `withFormik` expose extra callbacks** — `onChange`, `onError`
  and `onTouched` — that have no Formik equivalent.
- **`touched` is derived** by diffing values against `initialValues` (an empty
  field whose initial value is also empty is therefore not "touched");
  `handleBlur` / `setFieldTouched` are additionally available to set touched
  explicitly.
- **`setFieldValue`/`setValues` third argument is `resetInitialValues`**, which
  re-baselines `initialValues` and `touched`, whereas Formik's third argument is
  `shouldValidate`.

## Field implementation

`Field` & `FastField` were originally not implemented. A `Field` component is
now provided in a slightly different form (Map-based errors, derived touched).
`FastField` is not implemented separately.

## Lessons learned

Some of the lessons learned from this fork can be moved over to Formik with some minor breaking changes to the procedural API.
