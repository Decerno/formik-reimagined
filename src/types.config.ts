import { ObjectSchema } from 'yup';
import { FormikReimaginedErrors, FormikReimaginedValues } from './types';

/**
 * Formik configuration options.
 */
export interface FormikReimaginedConfig<
  Props,
  Values extends FormikReimaginedValues = FormikReimaginedValues
> {
  /**
   * A Yup Schema
   */
  validationSchema?:
    | ObjectSchema<Values>
    | { (props: Props): ObjectSchema<Values> };

  /**
   * Validation function. Must return an error object (a `Map`) where keys map
   * to the corresponding field path. May also return a `Promise` of such a
   * `Map`; async results are only applied through the imperative
   * `validateForm`/`validateField` helpers (the reactive reducer path ignores
   * pending promises to stay synchronous).
   */
  validate?: (
    values: Values,
    field?: string
  ) => FormikReimaginedErrors | Promise<FormikReimaginedErrors>;
}

/**
 * withFormik() configuration options.
 */
export interface WithFormikReimaginedConfig<
  Props,
  Values extends FormikReimaginedValues = FormikReimaginedValues
> extends FormikReimaginedConfig<Props, Values> {
  /**
   * Map props to the form values
   */
  mapPropsToValues?: (props: Props) => Values;
}
