import { getIn, setIn, toPath } from '../src/pathUtils';
import {
  errorsToObject,
  objectToErrors,
  getNestedFieldError,
} from '../src/errorObject';

describe('pathUtils', () => {
  describe('toPath', () => {
    it('splits dotted and bracket notation', () => {
      expect(toPath('users[0].name')).toEqual(['users', '0', 'name']);
      expect(toPath('a.b.c')).toEqual(['a', 'b', 'c']);
      expect(toPath('a')).toEqual(['a']);
    });
  });

  describe('getIn', () => {
    const obj = { a: { b: [{ c: 1 }] }, x: 0 };
    it('reads nested values', () => {
      expect(getIn(obj, 'a.b[0].c')).toBe(1);
      expect(getIn(obj, 'x')).toBe(0);
    });
    it('returns default when missing', () => {
      expect(getIn(obj, 'a.b[1].c', 'def')).toBe('def');
      expect(getIn(obj, 'nope', 'def')).toBe('def');
    });
  });

  describe('setIn', () => {
    it('sets a top-level value immutably', () => {
      const obj = { a: 1 };
      const next = setIn(obj, 'b', 2);
      expect(next).toEqual({ a: 1, b: 2 });
      expect(obj).toEqual({ a: 1 });
    });
    it('sets a nested object value, sharing untouched branches', () => {
      const obj = { a: { b: 1 }, keep: { z: 9 } };
      const next = setIn(obj, 'a.c', 2);
      expect(next).toEqual({ a: { b: 1, c: 2 }, keep: { z: 9 } });
      expect(next.keep).toBe(obj.keep);
    });
    it('creates arrays for integer segments', () => {
      const next = setIn({}, 'users[0].name', 'jared');
      expect(next).toEqual({ users: [{ name: 'jared' }] });
      expect(Array.isArray(next.users)).toBe(true);
    });
    it('removes a key when setting undefined', () => {
      const next = setIn({ a: 1, b: 2 }, 'a', undefined);
      expect(next).toEqual({ b: 2 });
    });
  });
});

describe('errorObject', () => {
  it('converts a flat error map into a nested object', () => {
    const map = new Map<string, string>([
      ['name', 'required'],
      ['users[0].lastName', 'required'],
    ]);
    expect(errorsToObject(map)).toEqual({
      name: 'required',
      users: [{ lastName: 'required' }],
    });
  });

  it('converts a nested object back into a flat map', () => {
    const obj = { name: 'required', users: [{ lastName: 'required' }] };
    const map = objectToErrors(obj);
    expect(Array.from(map.entries())).toEqual([
      ['name', 'required'],
      ['users[0].lastName', 'required'],
    ]);
  });

  it('round-trips object -> map -> object', () => {
    const map = new Map<string, string>([
      ['a.b', 'x'],
      ['list[1].c', 'y'],
    ]);
    expect(objectToErrors(errorsToObject(map))).toEqual(map);
  });

  it('reads nested field errors', () => {
    const map = new Map<string, string>([['users[0].lastName', 'required']]);
    expect(getNestedFieldError(map, 'users[0].lastName')).toBe('required');
    expect(getNestedFieldError(map, 'users[0]')).toEqual({
      lastName: 'required',
    });
  });
});
