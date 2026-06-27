import { FormikReimaginedErrors } from './types';
import { getIn, setIn } from './pathUtils';

/**
 * Nested error object shape, mirroring Formik's `FormikErrors<Values>`.
 * Leaf nodes are error message strings.
 */
export type FormikReimaginedErrorObject = {
  [key: string]: string | FormikReimaginedErrorObject | any;
};

/**
 * Convert the internal flat error `Map` into a nested object that mirrors the
 * shape of `Values`, matching Formik's `errors` representation.
 *
 * `Map([["users[0].name", "required"]])`
 * becomes
 * `{ users: [{ name: "required" }] }`
 */
export function errorsToObject(
  errors: FormikReimaginedErrors
): FormikReimaginedErrorObject {
  let result: FormikReimaginedErrorObject = {};
  for (const [path, message] of errors.entries()) {
    if (path == null) {
      continue;
    }
    result = setIn(result, path, message);
  }
  return result;
}

/**
 * Convert a nested error object (Formik shape) into the internal flat error
 * `Map`. The inverse of {@link errorsToObject}.
 */
export function objectToErrors(
  obj: FormikReimaginedErrorObject | undefined
): FormikReimaginedErrors {
  const errors: FormikReimaginedErrors = new Map<string, string>();
  if (obj == null) {
    return errors;
  }
  const visit = (value: any, prefix: string) => {
    if (value == null) {
      return;
    }
    if (typeof value === 'string') {
      errors.set(prefix, value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        visit(item, `${prefix}[${index}]`);
      });
      return;
    }
    if (typeof value === 'object') {
      for (const key of Object.keys(value)) {
        visit(value[key], prefix ? `${prefix}.${key}` : key);
      }
    }
  };
  for (const key of Object.keys(obj)) {
    visit(obj[key], key);
  }
  return errors;
}

/**
 * Read a single error message for a field path out of the flat error `Map`.
 */
export function getFieldError(
  errors: FormikReimaginedErrors,
  field: string
): string | undefined {
  return errors.get(field);
}

/**
 * Read a nested error (object or string) for a field path. Useful when the
 * field refers to a sub-tree rather than a leaf.
 */
export function getNestedFieldError(
  errors: FormikReimaginedErrors,
  field: string
): string | FormikReimaginedErrorObject | undefined {
  const direct = errors.get(field);
  if (direct !== undefined) {
    return direct;
  }
  return getIn(errorsToObject(errors), field);
}
