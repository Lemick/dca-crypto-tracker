export function groupBy<T, K>(array: T[], classifierFn: (e: T) => K): Map<K, T[]> {
  return array.reduce(
    (entryMap, e) => entryMap.set(classifierFn(e), [...entryMap.get(classifierFn(e)) || [], e]),
    new Map()
  );
}

export function sum<T>(array: T[], numberAccessorFn: (e: T) => number): number {
  return array.reduce(
    (previousValue, currentElement) => previousValue + numberAccessorFn(currentElement),
    0
  );
}
