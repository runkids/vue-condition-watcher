export const fetcherIds = new WeakMap<Function, string>()
let counter = 0

export function getFetcherId(fn: Function): string {
  let id = fetcherIds.get(fn)
  if (!id) {
    counter += 1
    id = `F${counter}`
    fetcherIds.set(fn, id)
  }
  return id
}
