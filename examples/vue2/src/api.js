const users = params =>
  fetch('https://randomuser.me/api/?' + query(params), {
    method: 'GET'
  }).then(res => res.json())

const addBox = params => {
  console.log(params.offset)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        Array.from(Array(params.limit), (_, index) => {
          return {
            id: params.offset + index + 1,
            color: '#' + ('00000' + ((Math.random() * 0xffffff) << 0).toString(16)).slice(-6)
          }
        })
      )
    }, 1000)
  })
}

function query(params) {
  const esc = encodeURIComponent
  return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&')
}

export default {
  users,
  addBox
}
