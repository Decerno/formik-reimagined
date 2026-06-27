/**
 * Formik-named aliases for the `formik-reimagined` public surface.
 *
 * These let code written against Formik 2.4.x compile with minimal edits while
 * still using the reimagined, Map-based, reducer-driven engine under the hood.
 *
 * NOTE: a few intentional, irreducible differences remain (see README):
 *  - `errors` is a `Map<string, string>` keyed by field path, not a nested
 *    object. Use `errorsToObject` to obtain a Formik-shaped nested object.
 *  - `<Formik>`/`withFormik` expose extra `onChange`/`onError`/`onTouched`
 *    callbacks that have no Formik equivalent.
 *  - `setFieldValue`'s third argument is `resetInitialValues`, whereas Formik's
 *    is `shouldValidate`.
 */
import { FormikReimaginedProvider } from './FormikReimaginedProvider';
import { withFormikReimagined } from './withFormikReimagined';
import { useFormikReimagined } from './useFormikReimagined';
import { useFormikReimaginedContext } from './useFormikReimaginedContext';
import {
  FormikReimaginedState,
  FormikReimaginedErrors,
  FormikReimaginedTouched,
  FormikReimaginedValues,
} from './types';
import {
  FormikReimaginedProps,
  FormikReimaginedCallbacks,
} from './types.props';
import { FormikReimaginedConfig } from './types.config';

// --- Component / hook / HOC aliases -----------------------------------------

/** Alias for `FormikReimaginedProvider` (Formik's `<Formik>`). */
export const Formik = FormikReimaginedProvider;
/** Alias for `withFormikReimagined` (Formik's `withFormik`). */
export const withFormik = withFormikReimagined;
/** Alias for `useFormikReimagined` (Formik's `useFormik`). */
export const useFormik = useFormikReimagined;
/** Alias for `useFormikReimaginedContext` (Formik's `useFormikContext`). */
export const useFormikContext = useFormikReimaginedContext;

export { Field } from './Field';
export { ErrorMessage } from './ErrorMessage';
export { Form } from './Form';
export { connect } from './connect';

// --- Type aliases -----------------------------------------------------------

/** Alias for `FormikReimaginedProps` (Formik's `FormikProps`). */
export type FormikProps<Values> = FormikReimaginedProps<Values>;
/** Alias for `FormikReimaginedState` (Formik's `FormikState`). */
export type FormikState<Values> = FormikReimaginedState<Values>;
/** Alias for the flat error map (Formik's `FormikErrors` is a nested object). */
export type FormikErrors = FormikReimaginedErrors;
/** Alias for `FormikReimaginedTouched` (Formik's `FormikTouched`). */
export type FormikTouched = FormikReimaginedTouched;
/** Alias for `FormikReimaginedConfig` (Formik's `FormikConfig`). */
export type FormikConfig<
  Props,
  Values extends FormikReimaginedValues
> = FormikReimaginedConfig<Props, Values> &
  FormikReimaginedCallbacks<Props, Values>;
