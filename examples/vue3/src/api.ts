export type Users = {
  cell: string
  bob: {
    date: string
    age: number
  }
  email: string
  gender: string
  id: {
    name: string
    value: string
  }
  name: {
    title: string
    first: string
    last: string
  }
  phone: string
  picture: {
    large: string
    medium: string
    thumbnail: string
  }
}[]
export interface Result {
  info: {
    page: number
    results: number
    seed: string
    version: string
  }
  results: Users
}

const users = (params: Record<string, any>) =>
  fetch('https://randomuser.me/api/?' + query(params), { method: 'GET' }).then((res) => res.json() as Promise<Result>)

const photos = () => fetch('https://jsonplaceholder.typicode.com/photos', { method: 'GET' }).then((res) => res.json())

function query(params: Record<string, any>) {
  const esc = encodeURIComponent
  return Object.keys(params)
    .map((k) => esc(k) + '=' + esc(params[k]))
    .join('&')
}

export default {
  users,
  photos,
}
