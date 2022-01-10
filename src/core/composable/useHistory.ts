import { onMounted, onUnmounted, watch, Ref } from 'vue-demi'
import { HistoryOptions } from '../types'
import { stringifyQuery } from '../utils/common'

export interface HistoryConfig<K> extends HistoryOptions<K> {
  listener: (query: any) => void
}

function decode(text: string | number): string {
  try {
    return decodeURIComponent('' + text)
  } catch (err) {
    console.error(`Error decoding "${text}".`)
  }
  return '' + text
}

function parseQuery(search: string) {
  const query = {}
  if (search === '' || search === '?') return query
  const hasLeadingIM = search[0] === '?'
  const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&')
  for (let i = 0; i < searchParams.length; ++i) {
    let [key, rawValue] = searchParams[i].split('=') as [string, string | undefined]
    key = decode(key)
    let value = rawValue == null ? null : decode(rawValue)
    if (key in query) {
      let currentValue = query[key]
      if (!Array.isArray(currentValue)) {
        currentValue = query[key] = [currentValue]
      }
      currentValue.push(value)
    } else {
      query[key] = value
    }
  }
  return query
}

export function useHistory<K>(query: Ref, config: HistoryConfig<K>) {
  function createQuery() {
    const href = window.location.href.split('?')
    const search = href.length === 1 ? '' : '?' + href[1]
    config.listener(parseQuery(search))
  }

  watch(
    query,
    async () => {
      const path: string = config.sync.currentRoute.value
        ? config.sync.currentRoute.value.path
        : config.sync.currentRoute.path
      const queryString = stringifyQuery(query.value, config.ignore)
      const routeLocation = path + '?' + queryString
      try {
        config.navigation === 'replace' ? config.sync.replace(routeLocation) : config.sync.push(routeLocation)
      } catch (e) {
        throw new Error(`[vue-condition-watcher]: history.sync is not instance of vue-router. Please check.`)
      }
    },
    { deep: true }
  )

  // initial conditions by location.search. just do once when created.
  createQuery()

  onMounted(() => {
    window.addEventListener('popstate', createQuery)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', createQuery)
  })
}
