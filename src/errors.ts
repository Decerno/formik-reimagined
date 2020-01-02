import { FormikReimaginedErrors, FormikReimaginedValues } from './types';
import isFunction from 'lodash.isfunction';
import { ValidationError, ObjectSchema } from 'yup';

/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors<Values>(
  yupError: ValidationError
): FormikReimaginedErrors<Values> {
  let errors: FormikReimaginedErrors<Values> = new Map<keyof Values, string>();
  if (yupError.inner) {
    if (yupError.inner.length === 0) {
      errors.set(yupError.path as any, yupError.message);
    } else {
      for (let err of yupError.inner) {
        if (!errors.has(err.path as any)) {
          errors.set(err.path as any, err.message);
        }
      }
    }
  }
  return errors;
}
/**
 * Validate a yup schema.
 */
export function validateYupSchema<T extends FormikReimaginedValues>(
  values: T,
  schema: ObjectSchema<T>,
  context: any = {}
): Partial<T> {
  return schema['validateSync'](values, {
    abortEarly: false,
    context: context,
  });
}

/**
 * Run validation against a Yup schema and optionally run a function if successful
 */
export function runValidationSchema<Values extends object>(
  validationSchema: ObjectSchema<Values>,
  values: Values,
  field?: string
): FormikReimaginedErrors<Values> {
  const schema = isFunction(validationSchema)
    ? validationSchema(field)
    : validationSchema;
  try {
    if (field && schema.validateSyncAt) {
      schema.validateSyncAt(field, values);
    } else {
      validateYupSchema(values, schema);
    }
    return new Map();
  } catch (err) {
    // Yup will throw a validation error if validation fails. We catch those and
    // resolve them into Formik errors. We can sniff if something is a Yup error
    // by checking error.name.
    // @see https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
    if (err.name === 'ValidationError') {
      return yupToFormErrors(err);
    } else {
      // We throw any other errors
      console.warn(
        `Warning: An unhandled error was caught during validation`,
        err
      );
      throw new Error('Validation error error...');
    }
  }
}

export function runValidateHandler<Values>(
  validate: { (values: any, field?: string): FormikReimaginedErrors<Values> },
  values: Values,
  field?: string
): FormikReimaginedErrors<Values> {
  const maybeErrors = (validate as any)(values, field);
  if (maybeErrors == null) {
    // use loose null check here on purpose
    return new Map();
  } else {
    return maybeErrors;
  }
}
