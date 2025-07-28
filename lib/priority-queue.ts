interface QueueItem {
  id: string
  priority: number
  data: any
  timestamp: Date
}

export class PriorityQueue {
  private items: QueueItem[] = []

  enqueue(item: QueueItem) {
    this.items.push(item)
    this.items.sort((a, b) => b.priority - a.priority) // Higher priority first
  }

  dequeue(): QueueItem | undefined {
    return this.items.shift()
  }

  peek(): QueueItem | undefined {
    return this.items[0]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }

  clear() {
    this.items = []
  }
}

export const messageQueue = new PriorityQueue()
