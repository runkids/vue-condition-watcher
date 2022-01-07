const users = (params: any) =>
  fetch('https://randomuser.me/api/?' + query(params), { method: 'GET' }).then((res) => res.json())

const photos = () => fetch('https://jsonplaceholder.typicode.com/photos', { method: 'GET' }).then((res) => res.json())

function query(params: any) {
  const esc = encodeURIComponent
  return Object.keys(params)
    .map((k) => esc(k) + '=' + esc(params[k]))
    .join('&')
}

export default {
  users,
  photos,
}
