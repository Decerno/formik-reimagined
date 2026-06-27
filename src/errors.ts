import { FormikReimaginedErrors, FormikReimaginedValues } from './types';
import isFunction from 'lodash.isfunction';
import { ValidationError, ObjectSchema } from 'yup';

/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors(
  yupError: ValidationError
): FormikReimaginedErrors {
  let errors: FormikReimaginedErrors = new Map<string, string>();
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
): FormikReimaginedErrors {
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
    if (err instanceof ValidationError) {
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
  validate: {
    (values: any, field?: string):
      | FormikReimaginedErrors
      | Promise<FormikReimaginedErrors>;
  },
  values: Values,
  field?: string
): FormikReimaginedErrors {
  const maybeErrors = (validate as any)(values, field);
  if (maybeErrors == null) {
    // use loose null check here on purpose
    return new Map();
  }
  // Async validate functions return a thenable; the reactive reducer path
  // cannot await, so we ignore pending promises here. Use validateForm() to
  // obtain async validation results.
  if (typeof (maybeErrors as any).then === 'function') {
    return new Map();
  }
  return maybeErrors;
}

/**
 * Async-aware variant of {@link runValidateHandler}. Supports `validate`
 * functions that return either a `Map` synchronously or a `Promise<Map>`.
 */
export async function runValidateHandlerAsync<Values>(
  validate: {
    (values: any, field?: string):
      | FormikReimaginedErrors
      | Promise<FormikReimaginedErrors>;
  },
  values: Values,
  field?: string
): Promise<FormikReimaginedErrors> {
  const maybeErrors = await (validate as any)(values, field);
  if (maybeErrors == null) {
    return new Map();
  }
  return maybeErrors;
}

/**
 * Async-aware variant of {@link runValidationSchema}. Uses Yup's async
 * `validate`/`validateAt` so that schemas containing async tests are honored.
 */
export async function runValidationSchemaAsync<Values extends object>(
  validationSchema: ObjectSchema<Values>,
  values: Values,
  field?: string
): Promise<FormikReimaginedErrors> {
  const schema: any = isFunction(validationSchema)
    ? (validationSchema as any)(field)
    : validationSchema;
  try {
    if (field && schema.validateAt) {
      await schema.validateAt(field, values, { abortEarly: false });
    } else {
      await schema.validate(values, { abortEarly: false });
    }
    return new Map();
  } catch (err) {
    if (err instanceof ValidationError) {
      return yupToFormErrors(err);
    }
    console.warn(
      `Warning: An unhandled error was caught during validation`,
      err
    );
    throw new Error('Validation error error...');
  }
}
