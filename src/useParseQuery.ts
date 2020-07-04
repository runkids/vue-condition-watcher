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

export function useParseQuery(queryString?: string) {
  const href = window.location.href.split('?')
  const search = href.length === 1 ? '' : '?' + href[1]
  let query = queryString ? queryString : search
  return {
    query: parseQuery(query),
  }
}
