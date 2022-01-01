export function usePromiseQueue() {
  let queue = []
  let workingOnPromise = false

  function enqueue(promise) {
    return new Promise((resolve, reject) => {
      queue.push({
        promise,
        resolve,
        reject,
      })
      dequeue()
    })
  }

  function dequeue() {
    if (workingOnPromise) {
      return false
    }
    const item = queue.shift()
    if (!item) {
      return false
    }
    try {
      workingOnPromise = true
      item
        .promise()
        .then((value) => {
          workingOnPromise = false
          item.resolve(value)
          dequeue()
        })
        .catch((err) => {
          workingOnPromise = false
          item.reject(err)
          dequeue()
        })
    } catch (err) {
      workingOnPromise = false
      item.reject(err)
      dequeue()
    }
    return true
  }

  return {
    enqueue,
    dequeue,
  }
}
