import { ValueIteratee, List } from "lodash";
import transform from "lodash/transform";
import omit from "lodash/omit";
import isEqual from "lodash/isEqual";
import isObject from "lodash/isObject";
import keyBy from "lodash/keyBy";
import pickBy from "lodash/pickBy";
import xorWith from "lodash/xorWith";
import isEmpty from "lodash/isEmpty";
import intersectionWith from "lodash/intersectionWith";
import uniqBy from "lodash/fp/uniqBy";
import groupBy from "lodash/fp/groupBy";
import { LodashGroupBy1x1 } from "lodash/fp";
import { keyType, Dict, WithId, WithOptId } from "./types";
import dayjs from "dayjs";
import { throwDevError } from "./nativeJs";

/**
 * Make an array or single always an array.
 */
export function toArray<T>(xs: T | T[] | undefined) {
  if (!xs) return [];

  if (Array.isArray(xs)) return xs;
  else return [xs];
}

/**
 * undefined -> {}, {...} -> {...}
 *
 * Useful for spreading.
 */
export const toObject = <T extends object>(x?: T): T | {} => (x ? x : {});

/**
 * With thanks: https://gist.github.com/Yimiprod/7ee176597fef230d1451
 *
 * Deep diff between two objects, using lodash.
 * @param  Object object to subtract from `base`
 * @param  Object base
 * @return Object        A new object which represents the diff, with entries:
 *                         - in `object` that are not in `base`
 *                         - in `object` with a different value to the
 *                           same-keyed entry in `base`
 *                       Note that it does _not_ have keys in `base` that
 *                       are not in `object`.
 */
export function diff(
  object: Dict<any>,
  base: object,
  isEq?: (objectValue: any, baseValue: any, key: string) => boolean,
  ignoreRecurse?: (key: string, value: any) => boolean
): object {
  const equal = isEq || ((x, y, key) => isEqual(x, y));

  function changes(object: Dict<any>, base: object): object {
    return transform(object, function (result, value, key) {
      // If `object[key] != base[key]`, return an object with
      // { [key]: object[key] }
      if (!equal(value, base[key], key)) {
        result[key] =
          isObject(value) &&
          isObject(base[key]) &&
          (!ignoreRecurse || !ignoreRecurse(key, value))
            ? changes(value, base[key])
            : value;
      }
      // otherwise we have `object[key] == base[key]`, so don't include
      // this entry in the diff
    });
  }
  return changes(object, base);
}
/**
 * Use this with `diff` when x and y are dayjs or array.
 * If x and y are dayjs, then not using this will cause `diff` to recurse the
 * dayjs object, breaking it. If x and y are arrays, they will be compared as
 * sets.
 */
export function shallowEq(x: any, y: any) {
  if (isUndef(x) && isUndef(y)) return true;
  if (dayjs.isDayjs(x) || dayjs.isDayjs(y))
    return dayjs.isDayjs(x) && dayjs.isDayjs(y)
      ? x.toISOString() === y.toISOString()
      : false;
  if (Array.isArray(x) && Array.isArray(y)) {
    return xorWith(x, y, shallowEq).length === 0;
  }

  return isEqual(x, y);

  function isUndef(z: any) {
    return z === undefined || z === null;
  }
}

export function shallowDiff(
  object: Dict<any>,
  base: object,
  ignoreRecurse?: (key: string, value: any) => boolean
) {
  return diff(object, base, shallowEq, (() => true) || ignoreRecurse);
}

/**
 * Suppose x in 'ts' satisfies 'shouldSplice'
 *     t falsey -> remove x
 *     t truthy -> replace x with t
 *
 * If x does not exist and t is defined, then 't' will be pushed to 'ts'.
 *
 * Does not mutate 'ts'.
 */
export function spliceOrPush<T>(
  ts: T[],
  t: T | undefined,
  // finds an element in 'ts' that should be replaced by 't'. If no such
  // element exists, 't' is pushed to 'ts.
  shouldSplice: (a: T) => boolean
) {
  const tIndex = ts.findIndex(shouldSplice);
  let newTs: T[] = [...ts];

  if (t) {
    if (tIndex === -1) newTs.push(t);
    else {
      newTs.splice(tIndex, 1, t);
    }
  } else newTs = newTs.splice(tIndex, 1);

  return newTs;
}

/**
 * f(x) if x is defined.
 */
export function applyIfDefined<U, V>(x: U | undefined, f: (x: U) => V) {
  if (x) return f(x);
}

/**
 * Remove 'keys' from 'o', returning a copy of 'o'.
 */
export function removeKeys<T extends object, K extends keyof T>(
  o: T,
  ...keys: K[]
) {
  const newO = { ...o };

  for (const k in keys) {
    delete newO[k];
  }

  return newO;
}

export function keyById<T extends WithId>(xs: T[]) {
  return keyBy(xs, (x) => x.id);
}
export const uniqById = uniqBy("id");
export const intersectWithId = <T extends WithOptId>(
  xs: T[],
  ys: WithOptId[]
): T[] => intersectionWith(xs, ys, (x, y) => x.id === y.id);

export function isDefined(x: any) {
  return x !== undefined && x !== null;
}

// null == undefined
export function definedEqual(x: any, y: any) {
  if (!isDefined(x) && !isDefined(y)) return true;
  else return isEqual(x, y);
}

export function isTruthy<T>(x: T | undefined | null | false): boolean {
  return x !== undefined && x !== null && x !== false;
}

export function undefIfNotTruthy<T>(x: T | undefined | null): T | undefined {
  return isTruthy(x) ? x : undefined;
}

export function boolXor(x: any, y: any) {
  return !!x !== !!y;
}

export const entriesWithDefinedVal = <T extends object = object>(o: T) =>
  pickBy(o, (x) => x);
export function hasDefinedEntries(o: object) {
  return !isEmpty(entriesWithDefinedVal(o));
}

/** Cycle `permutation` at index `i` */
export function cycle<T>(permutation: T[], i: number | undefined) {
  const len = permutation.length;
  const nextIndex = i + 1;

  if (len === 0) throwDevError();

  if (i !== undefined && (i < 0 || nextIndex > len)) throwDevError();

  if (i === undefined || nextIndex === len) return permutation[0];
  else return permutation[nextIndex];
}

export function setsEq<T>(s1: Set<T>, s2: Set<T>) {
  return s1.size === s2.size && Array.from(s1).every((s) => s2.has(s));
}

export const nonEmptyDiff = (x, y) => !isEmpty(diff(x, y));

export const omitKey = (x) => omit(x, keyType);

export const getCompareOn = <C>(f: (c: C) => string) => (c1: C, c2: C) =>
  f(c1).localeCompare(f(c2));

export const defineKeysAndGroupBy = <K extends string, T>(
  keys: K[],
  f: ValueIteratee<T>
) => (x: List<T> | object) =>
  ({
    ...keys.reduce((acc, k) => ({ ...acc, [k]: [] }), {}),
    ...groupBy(f)(x),
  } as Record<K, T[]>);
