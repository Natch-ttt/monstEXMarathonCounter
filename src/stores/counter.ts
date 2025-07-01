// src/stores/counter.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

/** 型: 成功周回ログ */
export interface RecordSuccess {
  runs:      number   // 当時の currentRunCount
  timestamp: number   // ミリ秒
  collected: number   // 収集数
  luck:      number   // 累計ラック数
}

/** 型: 遭遇ログ */
export interface EncounterLog {
  count:     number   // 取得数（0 は敗北）
  timestamp: number
}

/** 型: カウンター単位の状態 */
export interface CounterItem {
  id:                string
  name:              string
  runCount:          number          // 累計周回数
  currentRunCount:   number          // 今サイクル周回数
  encounterCount:    number          // 累計遭遇数
  encounterLogs:     EncounterLog[]  // 遭遇ログ（全件）
  recordSuccess:     RecordSuccess[] // 成功周回ログ
  exDefeats:         number          // 敗北数（全期間）
  runLogs:           number[]        // 周回完了タイムスタンプ一覧
  treasureLogs:   EncounterLog[]  // 至宝発動ログ：count＝発動数
  luckyRizaLogs:  EncounterLog[]  // ラキリザ発生ログ：count＝発生数
}

/** 型: 期間集計結果 */
export interface PeriodMetrics {
  runs:          number      // 今サイクル周回数
  totalRuns:     number      // 合計周回数（期間内）
  encounters:    number      // 遭遇数
  encounterRate: number      // 遭遇率（%）
  fastest:       number|null // 最短周回数
  slowest:       number|null // 最長周回数
  average:       number|null // 平均周回数
  defeats:       number      // 敗北数
  lastTs:        number      // 最終更新タイムスタンプ
}

/** 型: 禁忌EXメトリクス集計結果 */
export interface PeriodTabooMetrics {
  treasureCount:    number      // 至宝発動数
  treasureRate:     number      // 発動率（%）
  luckyRizaCount:   number      // ラキリザ数
  luckyRizaRate:    number      // 発生率（%）
}

/** 型: 累計／月別／日別 */
export type Period = 'all' | 'month' | 'day'

const STORAGE_KEY = 'monst-counters'
const today = new Date()

// 初期の YYYY-MM
const initialMonth  = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`
// 初期の YYYY-MM-DD
const initialDay    = [
  today.getFullYear(),
  String(today.getMonth()+1).padStart(2,'0'),
  String(today.getDate()).padStart(2,'0')
].join('-')

export const useCounterStore = defineStore('counter', () => {
  //--- state ------------------------------------------------
  const counters      = ref<CounterItem[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )
  // 期間／日付キー／ソート順をストアで共有
  const period        = ref<Period>('all')
  const selectedMonth = ref<string>(initialMonth)
  const selectedDay   = ref<string>(initialDay)
  const sortAsc       = ref<boolean>(true)

  //--- persistence ------------------------------------------
  watch(
    counters,
    val => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
    { deep: true }
  )

  //--- core actions -----------------------------------------
  function remove(id: string) {
    counters.value = counters.value.filter(c => c.id !== id)
  }
  function add(name: string) {
    counters.value.push({
      id:                Date.now().toString(),
      name,
      runCount:          0,
      currentRunCount:   0,
      encounterCount:    0,
      encounterLogs:     [],
      recordSuccess:     [],
      exDefeats:         0,
      runLogs:           [],
      treasureLogs:      [],
      luckyRizaLogs:     [],
    })
  }
  function updateName(id: string, newName: string) {
    const item = getItem(id)
    if (item) item.name = newName
  }
  function getItem(id: string) {
    return counters.value.find(c => c.id === id)
  }
  function incrementRun(id: string) {
    const item = getItem(id)!
    item.runCount++
    item.currentRunCount++
    item.runLogs.push(Date.now())
  }
  function decrementRun(id: string) {
    const item = getItem(id)!
    if (item.runCount > 0) {
      item.runCount--
      if (item.currentRunCount > 0) item.currentRunCount--
      if (item.runLogs.length) item.runLogs.pop()
    }
  }
  function resetAll(id: string) {
    const item = getItem(id)!
    item.runCount         = 0
    item.currentRunCount  = 0
    item.runLogs          = []
    item.encounterCount   = 0
    item.encounterLogs    = []
    item.recordSuccess    = []
    item.exDefeats        = 0

    // --- 禁忌EX用データもリセット ---
    item.treasureLogs     = []
    item.luckyRizaLogs    = []
  }
  function onEncounter(id: string, num: number) {
    const item = getItem(id)!
    const ts = Date.now()
    item.encounterLogs.push({ count: num, timestamp: ts })
    if (num <= 0) {
      item.exDefeats++
    } else {
      item.encounterCount += num
      item.recordSuccess.push({
        runs:      item.currentRunCount,
        timestamp: ts,
        collected: num,
        luck:      item.encounterCount
      })
    }
    item.currentRunCount = 0
    // 今回分完了：runLogs もクリア（月別/日別集計の基データ）
    item.runLogs = []
  }

  //--- 禁忌EX用ログ追加アクション ----------------------------
  function onTreasure(id: string, num: number) {
    const item = getItem(id)!
    item.treasureLogs.push({ count: num, timestamp: Date.now() })
  }

  function onLuckyRiza(id: string, num: number) {
    const item = getItem(id)!
    item.luckyRizaLogs.push({ count: num, timestamp: Date.now() })
  }

  //--- ヘルパ：ローカル日付ベースでフィルタ --------------------
  function filterTs<T extends { timestamp: number }>(
    ar: T[],
    p: Period,
    dateKey?: string
  ): T[] {
    if (p === 'all') return ar

    return ar.filter(item => {
      const d  = new Date(item.timestamp)
      const Y  = d.getFullYear()
      const M  = String(d.getMonth()+1).padStart(2,'0')
      const D  = String(d.getDate()).padStart(2,'0')
      if (p === 'month') {
        return dateKey === `${Y}-${M}`
      }
      // day
      return dateKey === `${Y}-${M}-${D}`
    })
  }

  //--- 期間集計 (呼び出し元で period/dateKey を渡す方式) ----------
  function periodMetrics(
    id: string,
    p: Period,
    dateKey?: string
  ): PeriodMetrics {
    const item = getItem(id)!
    const runEntries   = item.runLogs.map(ts => ({ timestamp: ts }))
    const filteredRuns = filterTs(runEntries,        p, dateKey)
    const filteredSucc = filterTs(item.recordSuccess, p, dateKey)

    // 振り分け・集計
    const encLogs    = filterTs(item.encounterLogs, p, dateKey)
    const encounters = encLogs.filter(e => e.count > 0).length
    const defeats    = encLogs.filter(e => e.count <= 0).length

    const fastest = filteredSucc.length
      ? Math.min(...filteredSucc.map(s => s.runs))
      : null
    const slowest = filteredSucc.length
      ? Math.max(...filteredSucc.map(s => s.runs))
      : null
    const average = filteredSucc.length
      ? filteredSucc.reduce((s, r) => s + r.runs, 0) / filteredSucc.length
      : null

    const runs = filteredRuns.length
    let totalRuns: number
    if (p === 'all') {
      totalRuns = item.runCount
    } else {
      const sumSuccRuns = filteredSucc.reduce((s, r) => s + r.runs, 0)
      totalRuns = sumSuccRuns + runs
    }
    const encounterRate = totalRuns ? (encounters / totalRuns) * 100 : 0

    const allTs = [
      ...item.runLogs,
      ...item.encounterLogs.map(e => e.timestamp),
      ...item.recordSuccess.map(s => s.timestamp)
    ]
    const lastTs = allTs.length ? Math.max(...allTs) : Date.now()

    return {
      runs,
      totalRuns,
      encounters,
      encounterRate,
      fastest,
      slowest,
      average,
      defeats,
      lastTs
    }
  }

  //--- 期間集計 (禁忌EXメトリクス) ----------------------------
  function periodTabooMetrics(
    id: string,
    p: Period,
    dateKey?: string
  ): PeriodTabooMetrics {
    const base     = periodMetrics(id, p, dateKey)
    const item     = getItem(id)!
    const tLogs    = filterTs(item.treasureLogs,  p, dateKey)
    const lLogs    = filterTs(item.luckyRizaLogs, p, dateKey)

    const treasureCount  = tLogs.reduce((sum, e) => sum + e.count, 0)
    const luckyRizaCount = lLogs.reduce((sum, e) => sum + e.count, 0)
    const total      = base.encounters || 0

    return {
      treasureCount,
      treasureRate:    total ? (treasureCount  / total) * 100 : 0,
      luckyRizaCount,
      luckyRizaRate:   total ? (luckyRizaCount / total) * 100 : 0
    }
  }

  //--- setter --------------------------------------
  function setPeriod(p: Period) {
    period.value = p
    // 月別/日別モードに切り替えたときはデフォルトキーをリセット
    if (p === 'month') selectedMonth.value = initialMonth
    if (p === 'day')   selectedDay.value   = initialDay
  }
  function setSelectedMonth(m: string) {
    selectedMonth.value = m
    period.value        = 'month'
  }
  function setSelectedDay(d: string) {
    selectedDay.value = d
    period.value      = 'day'
  }
  function toggleSort() {
    sortAsc.value = !sortAsc.value
  }

  //--- ② フィルタ→ソート→連番付与パイプライン ------------------
  function getFilteredLogs(id: string): RecordSuccess[] {
    const rec = getItem(id)?.recordSuccess ?? []
    if (period.value === 'all') return rec

    const key = period.value === 'month'
      ? selectedMonth.value
      : period.value === 'day'
        ? selectedDay.value
        : undefined

    return filterTs(rec, period.value, key)
  }

  function getSortedLogs(id: string): RecordSuccess[] {
    return [...getFilteredLogs(id)].sort((a, b) =>
      sortAsc.value
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp
    )
  }

  function getNumberedLogs(id: string) {
    return getSortedLogs(id).map((r, i) => ({
      ...r,
      seq: i + 1
    }))
  }

  //--- return API --------------------------------------------
  return {
    counters,
    remove,
    add,
    updateName,
    getItem,
    incrementRun,
    decrementRun,
    resetAll,
    onEncounter,
    periodMetrics,    // 既存の集計
    filterTs,         // ヘルパ
    // state & setter
    period,
    selectedMonth,
    selectedDay,
    sortAsc,
    setPeriod,
    setSelectedMonth,
    setSelectedDay,
    toggleSort,
    // 取得パイプライン
    getFilteredLogs,
    getSortedLogs,
    getNumberedLogs,
    // 禁忌EX
    onTreasure,
    onLuckyRiza,
    periodTabooMetrics,
  }
})
