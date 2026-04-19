const queue: Array<() => void> = []

export function enqueueMountCallback(cb: () => void): () => void {
  queue.push(cb)
  return () => {
    const i = queue.indexOf(cb)
    if (i >= 0) queue.splice(i, 1)
  }
}

export function processMountQueue() {
  if (queue.length > 0) queue.shift()!()
}
