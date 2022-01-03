/**
 * Useful types.
 */

export type ValueOf<T> = T[keyof T]
export type Dict<V> = Record<string, V>
export type StringMap<K extends keyof any> = Record<K, string>
export type Nullable<T> = T | null
export type KeysEnum<T> = { [P in keyof Required<T>]: P }

export type Id = string
export type IdMap<T> = Record<Id, T>
type IdType = "id"
export type OmitId<T> = Omit<T, IdType>
export type WithId<TObj = {}, TId = string> = TObj & { id: TId }
export type WithOptId = Partial<WithId>
export type OnlyId<TObj = {}, TId = string> = Partial<TObj> & { id: TId }

export const keyType = "key"
type KeyType = "key"
export type WithKey<TObj = {}, TKey = string> = TObj & { key: TKey }
export type WithoutKey<T> = Omit<T, KeyType>

export type Falsey = null | undefined
export type OptionalProps<T, K extends keyof T> = Partial<T> & Omit<T, K>
// Require a types property.
// With thanks:
// https://stackoverflow.com/a/63664560
export type RequireProps<T, K extends keyof T> = T & Required<Pick<T, K>>
export interface WithLoading {
	loading?: boolean
}
export type MutationType = "post" | "delete" | "patch"

/**
 * Type declarations.
 */
export const isString = (x: any): x is string => typeof x === "string"

/**
 * With thanks:
 * https://stackoverflow.com/a/60932900
 */
// Checks, if T misses keys from U
// type CheckMissing<T extends readonly any[], U extends Record<string, any>> = {
//     [K in keyof U]: K extends T[number] ? never : K
// }[keyof U] extends never ? T : T & "Error: missing keys"
// // Note: `T & "Error: missing keys"` is just for nice IDE errors. You could also write `never`.

// // Checks, if T contains duplicate items
// type CheckDuplicate<T extends readonly any[]> = {
//     [P1 in keyof T]: "_flag_" extends
//     { [P2 in keyof T]: P2 extends P1 ? never :
//         T[P2] extends T[P1] ? "_flag_" : never }[keyof T] ?
//     [T[P1], "Error: duplicate"] : T[P1]
// }
// export function createKeys<S extends readonly object, T = readonly (keyof S)[] | [keyof S]>(
//     t: T & CheckMissing<T, S> & CheckDuplicate<T>): T {
//     return t
// }
export const createKeys = <T>(x: (keyof T)[]) => x

/**
 * With thanks: https://stackoverflow.com/a/57683652
 */
// expands object types one level deep
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
// expands object types recursively
export type ExpandRecursively<T> = T extends object
	? T extends infer O
		? { [K in keyof O]: ExpandRecursively<O[K]> }
		: never
	: T

export type UnionKeys<T> = T extends any ? keyof T : never
export type DistributivePick<T, K extends UnionKeys<T>> = T extends any
	? Pick<T, Extract<keyof T, K>>
	: never
