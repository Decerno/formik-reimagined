/**
 * Path access primitives compatible with Formik's `getIn`/`setIn`.
 *
 * Paths may use dot notation and/or bracket notation, e.g.
 * `users[0].name` or `users.0.name`.
 */

/**
 * Split a string path into its individual segments.
 *
 * `users[0].name` -> `['users', '0', 'name']`
 */
export function toPath(key: string | Array<string | number>): string[] {
  if (Array.isArray(key)) {
    return key.map(k => `${k}`);
  }
  const result: string[] = [];
  // Match property accessors and bracketed indices/keys.
  const pattern = /[^.[\]]+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(key)) !== null) {
    result.push(match[0]);
  }
  return result;
}

/**
 * Deeply get a value from an object/array using a path.
 * Returns `def` when the value cannot be resolved.
 */
export function getIn(
  obj: any,
  key: string | Array<string | number>,
  def?: any,
  p: number = 0
): any {
  const path = toPath(key);
  while (obj != null && p < path.length) {
    obj = obj[path[p++]];
  }

  if (p !== path.length && obj == null) {
    return def;
  }
  return obj === undefined ? def : obj;
}

/** @private is the given object/array a non-empty container? */
function isObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object';
}

/** @private numeric-string check used to decide array vs object creation */
function isInteger(value: string): boolean {
  return String(Math.floor(Number(value))) === value;
}

/**
 * Deeply set a value in an object/array using a path, returning a shallow,
 * structurally-shared copy (the original object is not mutated). Setting a
 * value to `undefined` removes the corresponding key.
 */
export function setIn(obj: any, path: string, value: any): any {
  const res: any = Array.isArray(obj) ? [...obj] : { ...obj };
  const segments = toPath(path);
  let cursor: any = res;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const existing = getIn(obj, segments.slice(0, i + 1));

    if (existing != null && isObject(existing)) {
      cursor = cursor[segment] = Array.isArray(existing)
        ? [...existing]
        : { ...existing };
    } else {
      const nextSegment = segments[i + 1];
      cursor = cursor[segment] =
        isInteger(nextSegment) && Number(nextSegment) >= 0 ? [] : {};
    }
  }

  if (segments.length === 0) {
    return value;
  }

  // The last segment is where we actually assign or delete.
  const lastSegment = segments[segments.length - 1];
  if (value === undefined) {
    if (Array.isArray(cursor)) {
      cursor.splice(Number(lastSegment), 1);
    } else {
      delete cursor[lastSegment];
    }
  } else {
    cursor[lastSegment] = value;
  }

  // If we set the very root with a single segment and value is undefined,
  // ensure we still return a valid container.
  return res;
}
