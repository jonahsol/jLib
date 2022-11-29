import { useMemo } from "react";
import { Dict } from "../../types";
import keyBy from "lodash/keyBy";

export default function useKeyBy<T>(
  toKey: T[] | undefined,
  getKey: (t: T) => string
) {
  const keyed: Dict<T> | undefined = useMemo(
    () => toKey && keyBy(toKey, getKey),
    [toKey]
  );

  return keyed;
}
