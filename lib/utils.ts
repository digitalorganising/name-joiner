import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type Return<T, K extends KeysOfType<T, string>> = Expand<{
  [KK in string & T[K]]: Expand<{ [_ in K]: KK } & T>[];
}>;

export function groupBy<K extends KeysOfType<T, string>, T>(
  objs: T[],
  getKey: (item: T) => T[K]
): Return<T, K> {
  return objs.reduce((acc, obj) => {
    const partitionKey = getKey(obj) as keyof Return<T, K>;
    if (
      acc[partitionKey as keyof typeof acc] &&
      Array.isArray(acc[partitionKey])
    ) {
      acc[partitionKey].push(obj);
    } else {
      acc[partitionKey] = [obj] as Return<T, K>[keyof Return<T, K>];
    }
    return acc;
  }, {} as Return<T, K>);
}

export function mergeNamespaced(objs: Record<string, object>): object {
  return Object.entries(objs).reduce(
    (merged, [namespace, obj]) => ({
      ...merged,
      ...Object.entries(obj).reduce(
        (prefixed, [originalKey, value]) => ({
          ...prefixed,
          [`${namespace}_${originalKey}`]: value,
        }),
        {}
      ),
    }),
    {}
  );
}
