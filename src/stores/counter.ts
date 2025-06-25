// src/stores/counter.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Counter {
  id: string
  name: string
  count: number
}

export const useCounterStore = defineStore('counter', () => {
  const counters = ref<Counter[]>([])
  function add(name:string) {
    counters.value.push({ id:Date.now().toString(), name, count:0 })
  }
  function remove(id: string) {
    counters.value = counters.value.filter(c => c.id !== id)
  }
  function increment(id: string) {
    const c = counters.value.find(c => c.id === id)
    if (c) c.count++
  }
  function decrement(id: string) {
    const c = counters.value.find(c => c.id === id)
    if (c) c.count = Math.max(0, c.count - 1)
  }
  function resetCount(id: string) {
    const c = counters.value.find(c => c.id === id)
    if (c) c.count = 0
  }
  function updateName(id: string, newName: string) {
    const c = counters.value.find(c => c.id === id)
    if (c) c.name = newName
  }

  return {
    counters,
    add,
    remove,
    increment,
    decrement,
    resetCount,
    updateName
  }
})
