import { SetState, GetState } from "zustand";
import { produce } from "immer";

export type StateUpdaterFunc<S> = (prevState: S) => S;
export type StateUpdaterProduceFunc<S> = (s: StateUpdaterFunc<S>) => void;

export function getUpdaterProducerFunc<Store, K extends keyof Store>(
  // @ts-expect-error
  set: SetState<Store>,
  key: K
) {
  return (f: StateUpdaterFunc<Store[K]>) => {
    set((store) =>
      produce(store, (draft) => {
        // @ts-expect-error
        draft[key] = f(draft[key]);
      })
    );
  };
}

export type ResettableStore<Store> = Store & { reset: () => void };
/**
 * Turns `getInitState` into a init store state func with `reset`.
 */
export function createResettableInitState<Store extends object>(
  getInitState: (set: SetState<Store>, get: GetState<Store>) => Store
) {
  return (
    set: SetState<ResettableStore<Store>>,
    get: GetState<ResettableStore<Store>>
  ): ResettableStore<Store> => ({
    ...getInitState(set, get),
    reset: () => set(getInitState(set, get)),
  });
}
