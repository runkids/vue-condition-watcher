const users = params => fetch('https://randomuser.me/api/?'+ query(params), {method:'GET'}).then(res => res.json())

function query (params) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&');
}

export default {
  users
}

