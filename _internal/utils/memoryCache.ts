import { Cache, Key } from '../types'

/**
 * Simple in-memory cache with TTL support.
 */
export class MemoryCache<T = any> implements Cache<T> {
  private store = new Map<string, { value: T; expires?: number }>()

  private ensure(key: string) {
    const item = this.store.get(key)
    if (item && item.expires && Date.now() > item.expires) {
      this.store.delete(key)
    }
  }

  has(key: Key): boolean {
    const k = String(key)
    this.ensure(k)
    return this.store.has(k)
  }

  get(key: Key): T | undefined {
    const k = String(key)
    this.ensure(k)
    return this.store.get(k)?.value
  }

  set(key: Key, value: T, ttl?: number): void {
    const k = String(key)
    this.store.set(k, {
      value,
      expires: ttl ? Date.now() + ttl : undefined,
    })
  }

  delete(key: Key): void {
    this.store.delete(String(key))
  }
}
