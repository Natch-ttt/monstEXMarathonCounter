// src/stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface CounterItem {
  id: string
  name: string
  runCount: number           // 周回数
  encounterCount: number     // 収集数（＝ラック）
  recordRuns: number[]       // 遭遇したときの周回数を push
  exDefeats: number          // 0収集＝敗北の回数
}

const STORAGE_KEY = 'monst-counters'

export const useCounterStore = defineStore('counter', () => {
  const counters = ref<CounterItem[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )

  // persistence
  watch(
    counters,
    (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
    { deep: true }
  )

  function add(name: string) {
    counters.value.push({
      id: Date.now().toString(),
      name,
      runCount: 0,
      encounterCount: 0,
      recordRuns: [],
      exDefeats: 0
    })
  }

  function remove(id: string) {
    counters.value = counters.value.filter((c) => c.id !== id)
  }

  function incrementRun(id: string) {
    getItem(id)!.runCount++
  }
  function decrementRun(id: string) {
    const item = getItem(id)!
    if (item.runCount > 0) item.runCount--
  }

  /** 遭遇ボタン押下 → 数値入力後に呼ぶ */
  function onEncounter(id: string, num: number) {
    const item = getItem(id)!
    if (num <= 0) {
      item.exDefeats++
    } else {
      item.encounterCount += num
      // recordRuns に追加
      item.recordRuns.push(item.runCount)
    }
  }

  function getItem(id: string) {
    return counters.value.find((c) => c.id === id)
  }

  // computed
  const fastest = (id: string) => {
    const item = getItem(id)!
    return item.recordRuns.length
      ? Math.min(...item.recordRuns)
      : null
  }
  const slowest = (id: string) => {
    const item = getItem(id)!
    return item.recordRuns.length
      ? Math.max(...item.recordRuns)
      : null
  }
  const encounterRate = (id: string) => {
    const item = getItem(id)!
    return item.runCount
      ? ((item.encounterCount / item.runCount) * 100).toFixed(1) + '%'
      : '–'
  }

  return {
    counters,
    add,
    remove,
    incrementRun,
    decrementRun,
    onEncounter,
    getItem,
    fastest,
    slowest,
    encounterRate
  }
})
