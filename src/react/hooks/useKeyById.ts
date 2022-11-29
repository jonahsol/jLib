import { WithId } from "../../types";
import useKeyBy from "./useKeyBy";

export default function useKeyById<T>(toKey?: WithId<T>[]) {
  return useKeyBy(toKey, (x) => x.id);
}
