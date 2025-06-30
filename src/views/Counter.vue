<template>
  <ion-page v-if="item">
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ item.name }}</ion-title>
        <!-- ヘッダーボタン群 -->
        <ion-buttons slot="end" class="header-end-button">
          <ion-button @click="toggleRecordMenu">
            <ion-icon slot="icon-only" :icon="menuOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding">
      <div class="content-wrapper">
        <!-- 期間モード切り替えボタン群 -->
        <div class="period-switcher">
          <button
            v-for="opt in options"
            :key="opt.value"
            :class="['period-btn', { active: period === opt.value }]"
            @click="onPeriodChange(opt.value)"
          >
            <ion-icon :icon="opt.icon" />
            <span>{{ opt.label }}</span>
            <div class="underline" v-if="period === opt.value"></div>
          </button>
        </div>

        <!-- 範囲ラベル ＋ カレンダーアイコン -->
        <div class="period-header">
          <p class="current-period">{{ currentPeriodLabel }}</p>
          <ion-button
            v-if="period !== 'all'"
            fill="clear"
            size="small"
            @click.stop="openPopover($event)"
          >
            <ion-icon :icon="currentPeriodIcon" />
          </ion-button>
        </div>

        <!-- ポップオーバー形式の日付／月選択用カレンダー -->
        <ion-popover
          v-if="period !== 'all'"
          :key="`popover-${period}`"
          :is-open="showPicker"
          :event="popoverEvent"
          @did-dismiss="onPopoverDismiss"
          side="bottom"
          alignment="center"
          backdrop-dismiss="true"
          :cssClass="popoverClasses"
        >
          <!-- Popover のヘッダー -->
          <ion-header>
            <ion-toolbar>
              <ion-title>
                {{ period === 'month' ? '年月を選択' : '日付を選択' }}
              </ion-title>
              <ion-buttons slot="end">
                <ion-button fill="clear" @click="showPicker = false">
                  <ion-icon slot="icon-only" :icon="close" />
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <!-- カレンダー本体 -->
          <ion-content class="popover-content">
            <!-- 月モード -->
            <ion-datetime
              v-if="period === 'month'"
              presentation="month-year"
              v-model="pickerMonth"
              display-format="YYYY/MM"
              picker-format="YYYY MMMM"
              :year-values="yearValues"
              :min="minMonth"
              :max="maxMonth"
              @ionChange="onMonthPicked"
            />
            <!-- 日モード -->
            <ion-datetime
              v-else
              presentation="date"
              v-model="pickerDay"
              display-format="YYYY/MM/DD"
              picker-format="YYYY MMMM DD"
              :year-values="yearValues"
              :min="minDay"
              :max="maxDay"
              @ionChange="onDayPicked"
            />
          </ion-content>
        </ion-popover>

        <!-- 最終更新時刻 -->
        <p class="last-update">
          最終更新: {{ lastUpdateFormatted }}
        </p>

        <!-- カードメトリクス -->
        <ion-grid class="metrics-grid">
          <ion-row>
            <ion-col size="6" v-for="m in dispMetrics" :key="m.label">
              <ion-card class="metric-card">
                <ion-card-header>
                  <ion-card-title>
                    <!-- Ionicon か MDI か FontAwesomeIcon 切り替え -->
                    <template v-if="m.mdi">
                      <i class="material-icons metric-icon">{{ m.mdi }}</i>
                    </template>
                    <template v-else-if="m.fai">
                      <font-awesome-icon :icon="m.fai" class="metric-icon" />
                    </template>
                    <template v-else>
                      <ion-icon :icon="m.ion" class="metric-icon" />
                    </template>
                    {{ m.label }}
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <span class="metric-value">
                    {{ m.value }}
                    <span v-if="m.unit" class="metric-unit">{{ m.unit }}</span>
                  </span>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>

    <!-- フッターに固定ボタン群 -->
    <ion-footer>
      <ion-toolbar>
        <ion-grid class="button-group">
          <ion-row>
            <!-- 「−」と「リセット」を縦に並べる -->
            <ion-col size="2">
              <div class="small-btn-group">
                <ion-button
                  size="small"
                  shape="round"
                  fill="outline"
                  expand="block"
                  @click="decrement"
                  :disabled="pm.runs === 0"
                >
                  −
                </ion-button>
                <ion-button
                  size="small"
                  shape="round"
                  fill="outline"
                  expand="block"
                  @click="promptReset"
                >
                  <font-awesome-icon :icon="faEraser" />
                </ion-button>
              </div>
            </ion-col>

            <!-- 「＋」ボタン -->
            <ion-col size="5">
              <ion-button
                size="large"
                shape="round"
                color="primary"
                expand="block"
                @click="increment"
              >
                ＋
              </ion-button>
            </ion-col>

            <!-- 「遭遇」ボタン -->
            <ion-col size="5">
              <ion-button
                size="large"
                shape="round"
                color="tertiary"
                expand="block"
                @click="promptEncounter"
                :disabled="pm.runs === 0"
              >
                遭遇
              </ion-button>
            </ion-col>

          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton,
  IonContent, IonGrid, IonRow, IonCol, IonDatetime, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  menuController, alertController, onIonViewWillEnter,
} from '@ionic/vue'
import type { DatetimeCustomEvent } from '@ionic/vue'
import {
  sparkles, close, calendarOutline, calendarSharp, todaySharp, menuOutline
} from 'ionicons/icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faPersonRunning, faPercent, faClockRotateLeft, faEraser
} from '@fortawesome/free-solid-svg-icons'
import { useCounterStore } from '@/stores/counter'
// ルート／ストア
const route = useRoute()
const router = useRouter()
const id    = computed(() => route.params.id as string)
const store = useCounterStore()

const today = new Date()

// CounterItem の取得
const item = computed(() => store.getItem(id.value)!)

// 期間モード／選択キーは store 参照
const period        = computed(() => store.period)
const selectedMonth = computed(() => store.selectedMonth)
const selectedDay   = computed(() => store.selectedDay)
type Period = 'all' | 'month' | 'day'

// カウンター名
const counterName = computed(() => item.value?.name ?? '')

// セグメント用オプション
const options = [
  { value: 'all',   label: '累計', icon: calendarOutline },
  { value: 'month', label: '月別', icon: calendarSharp },
  { value: 'day',   label: '日別', icon: todaySharp }
] as const

// ポップオーバーに渡すクラスを computed で生成
const popoverClasses = computed<string[]>(() => {
  // month モードなら compact-popover のみ
  if (period.value === 'month') return ['compact-popover']
  // day モードなら compact-popover + wide-popover
  if (period.value === 'day') return ['compact-popover','wide-popover']
  // all モードは開かないはずなので fallback
  return []
})

// 期間切替
function onPeriodChange(v: Period) {
  store.setPeriod(v)
}

// 月別/日別の時刻ラベルを整形
const currentPeriodLabel = computed(() => {
  if (period.value === 'all') return ''
  if (period.value === 'month') {
    const [y, m] = selectedMonth.value.split('-')
    return `${y}年${m}月`
  }
  const [yy, mm, dd] = selectedDay.value.split('-')
  return `${yy}年${mm}月${dd}日`
})

// カレンダーアイコン
const currentPeriodIcon = computed(() => {
  const opt = options.find(o => o.value === period.value)
  return opt?.icon ?? calendarOutline
})

// サイドメニューのトグル
async function toggleRecordMenu() {
  await menuController.toggle('recordMenu')
}

// 指標用にストア periodMetrics を呼び出す
const pm = computed(() => store.periodMetrics(
  id.value,
  period.value,
  period.value === 'month'
    ? selectedMonth.value
    : period.value === 'day'
      ? selectedDay.value
      : undefined
))

// ——— カレンダーPopOver ———
const showPicker    = ref(false)
const popoverEvent = ref<UIEvent>()

// ローカル v-model 用
const pickerMonth   = ref<string>('')
const pickerDay     = ref<string>('')

// 比較用 old 値を覚えておく
let baseOldMonth = ''
let baseOldDay   = ''
let MAX_MONTH = ''

const startYear = 2000
const yearValues = computed(() => {
  const yy: number[] = []
  for (let y = startYear; y <= today.getFullYear(); y++) yy.push(y)
  return yy
})
const minMonth = `${startYear}-01`
const maxMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`
const minDay   = `${startYear}-01-01`
const maxDay   = [
  today.getFullYear(),
  String(today.getMonth()+1).padStart(2,'0'),
  String(today.getDate()).padStart(2,'0')
].join('-')

function openPopover(e: UIEvent) {
  popoverEvent.value = e

  // popover を開く直前に old／初期値をセット
  MAX_MONTH = maxMonth.split('-')[1]

  baseOldMonth      = store.selectedMonth
  pickerMonth.value = store.selectedMonth

  baseOldDay        = store.selectedDay
  pickerDay.value   = store.selectedDay

  showPicker.value   = true
}
function closePopover() {
  showPicker.value = false
}
// 月別カレンダー変更時
function onMonthPicked(e: DatetimeCustomEvent) {
  const v = e.detail.value
  if (typeof v !== 'string') return

  // 1) ローカル state に反映（UI 更新用）
  pickerMonth.value = v

  // 2) new／old の月部分を比較
  const [oldY, oldM] = baseOldMonth.split('-')
  const [newY, newM] = v.split('-')

  // 3) store にコミット && 初期値の再セット
  store.setSelectedMonth(v)

  // 4) 月が変わっていれば popover を閉じる
  if (oldY === newY && oldM !== newM) {
    closePopover()
  } else if (oldY !== newY && oldM !== newM && oldM > MAX_MONTH) {
    MAX_MONTH = '12'
  } else if (oldY !== newY && oldM !== newM ) {
    closePopover()
  }
}
// 日別カレンダー変更時
function onDayPicked(e: DatetimeCustomEvent) {
  const v = e.detail.value
  if (typeof v !== 'string') return

  // 1) ローカル state に反映（UI 更新用）
  pickerDay.value = v

  // 2) new／old の月部分を比較
  const [oldY, oldM, oldD] = baseOldDay.split('-')
  const [newY, newM, newD] = v.split('-')

  // 3) store にコミット && 初期値の再セット
  store.setSelectedDay(v)
  baseOldDay = store.selectedDay

  // 4) 日にちだけが変わっていれば popover を閉じる
  if (oldY === newY && oldM === newM && oldD !== newD) {
    closePopover()
  }
}
// Popover 全体の did-dismiss でもクローズを拾う
function onPopoverDismiss() {
  showPicker.value = false
}

// ページ表示・復帰時は累計モードにリセット
onIonViewWillEnter(() => {
  store.setPeriod('all')

  if (!item.value) {
    // まだレンダリング前の段階なら即時置き換え
    router.replace({ path: '/' })
  }
})

// 最終更新時刻をフォーマット
const lastUpdate = computed(() => new Date(pm.value.lastTs))
const lastUpdateFormatted = computed(() =>
  new Intl.DateTimeFormat('ja-JP', {
    year:   'numeric',
    month:  '2-digit',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(lastUpdate.value)
)

// 1件分のメトリクス定義
interface Metric {
  label: string
  unit: string
  value: string | number

  /** MDI を使う場合はアイコン文字列 */
  mdi?: string

  /** Ionicons を使う場合（ion-icon の :icon に渡す） */
  ion?: any /* Ionicons v7 の場合は IconDefinition 型 */

  /** FontAwesome を使う場合 */
  fai?: IconDefinition
}

// テンプレート表示用 metrics 配列 
const dispMetrics = computed<Metric[]>(() => [
  { label: '周回数',   fai: faPersonRunning,         unit: '周', value: pm.value.runs },
  { label: 'ラック',   ion: sparkles,                unit: '',   value: item.value.encounterCount },
  { label: '遭遇数',   mdi: 'flag',                  unit: '',   value: pm.value.encounters },
  { label: '遭遇率',   fai: faPercent,               unit: '%',  value: pm.value.encounterRate.toFixed(2) },
  { label: '最短周回', mdi: 'trending_down',         unit: pm.value.fastest !== null ? '周' : '',  value: pm.value.fastest  ?? '–' },
  { label: '最長周回', mdi: 'trending_up',           unit: pm.value.slowest  !== null ? '周' : '', value: pm.value.slowest  ?? '–' },
  { label: '平均周回', mdi: 'align_vertical_center', unit: pm.value.average !== null ? '周' : '',  value: pm.value.average?.toFixed(1) ?? '–' },
  { label: '総周回数', fai: faClockRotateLeft,       unit: '周', value: pm.value.totalRuns },
  { label: 'EX敗北数', ion: close,                   unit: '',   value: pm.value.defeats }
])

// ボタンハンドラ
function increment() { store.incrementRun(id.value) }
function decrement() { store.decrementRun(id.value) }

// リセットボタン押下時
async function promptReset() {
  const name = counterName.value
  const alert = await alertController.create({
    header: `「${name}」をリセット`,
    message: '累計・月別・日別の全データが消去されます。本当によろしいですか？',
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      {
        text: 'リセット',
        role: 'destructive',
        handler: () => {
          store.resetAll(id.value) // ストアの全リセット関数を呼ぶ
        }
      }
    ]
  })
  await alert.present()
}

/* 遭遇イベントポップアップ */
async function promptEncounter() {
  ;(document.activeElement as HTMLElement)?.blur()
  const alert = await alertController.create({
    header: '何体収集しましたか？',
    inputs: [{ name: 'num', type: 'number', min: '0', value: '1', attributes: { autofocus: true } }],
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      {
        text: '確定',
        handler: data => {
          const n = parseInt(data.num, 10)
          store.onEncounter(id.value, isNaN(n) ? 0 : n)
        }
      }
    ]
  })
  await alert.present()
}

</script>

<style scoped>
.header-end-button{
  margin-right: 1rem;
}

/* 中央寄せ＋幅制限をやや狭く */
.content-wrapper {
  max-width: 480px;
  margin: 0 auto;
}

/* 期間ステート */
.period-switcher {
  display: flex;
  justify-content: space-around;
  margin: 1rem 0 0.5rem;
}
.period-btn {
  position: relative;
  background: none;
  border: none;
  padding: 0.4rem 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--ion-color-medium);
  font-size: 0.75rem;
}
.period-btn.active {
  color: var(--ion-color-primary);
}
.period-btn .underline {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: var(--ion-color-primary);
}
.period-btn ion-icon {
  font-size: 1.2rem;
}
.period-btn span {
  font-size: 0.75rem;
}

/* — Popover 全体をコンパクト化 — */
/* ヘッダーやツールバー、タイトル、ボタン、アイコン、Datetime のフォントを小さめに */
::v-deep(.compact-popover ion-header),
::v-deep(.compact-popover ion-toolbar),
::v-deep(.compact-popover ion-title),
::v-deep(.compact-popover ion-button),
::v-deep(.compact-popover ion-icon),
::v-deep(.compact-popover .popover-content),
::v-deep(.compact-popover ion-datetime) {
  font-size: 0.85rem !important;
}

/* ツールバーの高さをコンパクトに */
::v-deep(.compact-popover ion-toolbar) {
  --min-height: 2rem;
}

/* Popover 内コンテンツの余白を詰める */
::v-deep(.compact-popover .popover-content) {
  --padding-top:    0.3rem;
  --padding-bottom: 0.3rem;
  --padding-start:  0.3rem;
  --padding-end:    0.3rem;
}

/* 範囲ラベル + カレンダーアイコン */
.period-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.2rem 0;
  height: 1.8rem;      /* 全体の高さを固定 */
  line-height: 1.8rem; /* テキストの縦位置を中央に */
}
.current-period {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ion-color-primary);
}

.calendar-btn {
  /* カレンダーアイコンボタンをコンパクト化 */
  --padding-start: 0;
  --padding-end:   0;
  --padding-top:   0;
  --padding-bottom:0;
  /* 幅・高さを固定 */
  width: 1.8rem;
  height: 1.8rem;
  /* 最小サイズ制約を外し、固定サイズに */
  --min-width:  0;
  --min-height: 0;
  width: 1.6rem;
  height: 1.6rem;
  margin-left: 0.3rem; /* ラベルとの間隔 */
  /* 背景や枠は元のままクリア */
  --border-radius: 0.2rem;
  /* 強調スタイル */
  --background: var(--ion-color-light);
  --color:      var(--ion-color-primary);
  border:       1px solid var(--ion-color-primary);
  box-shadow:   0 3px 3px rgba(0, 0, 0, 0.15);
  transition:   background-color 0.2s, box-shadow 0.2s;
  cursor:       pointer;
  padding:      0.1rem;
  margin-left:  0.7rem;
  border-radius: 0.2rem;
}
/* 中のアイコンを小さく */
.calendar-btn ::v-deep(ion-icon) {
  font-size: 1.2rem;
  line-height: 1.6rem;
}

/* LastUpdate */
.last-update {
  font-size: 0.75rem;
  text-align: center;
  color: var(--ion-color-medium);
  margin-bottom: 0.5rem;
}

/* カードグリッド */
.metrics-grid {
  --ion-grid-column-padding: 0.2rem;  /* 列間 */
  --ion-grid-row-padding:    0.1rem;  /* 行間 */
  margin-bottom: 0.5rem;
}
/* モバイル（横幅480px以下）ではさらに小さく */
@media (max-width: 480px) {
  .metrics-grid {
    --ion-grid-column-padding: 0.1rem;
  }
}

/* カードをコンパクトに */
.metric-card {
  margin: 0.2rem;
  text-align: center;
  --background: var(--ion-color-light);
  border-radius: 0.4rem;
}
.metric-card::part(header),
.metric-card::part(content) {
  padding-block-start:   0.2rem;
  padding-block-end:     0.2rem;
  padding-inline-start:  0.4rem;
  padding-inline-end:    0.4rem;
}
/* カードメトリクスのタイトル全体 */
.metric-card ion-card-title {
  /* 通常時のサイズ */
  font-size: 1.2rem;
  /* アイコンとテキストの行高さを揃える */
  line-height: 1.2;
}
/* モバイル（横幅480px以下）ではさらに小さく */
@media (max-width: 480px) {
  .metric-card ion-card-title {
    font-size: 0.9rem;
    max-height: 0.8rem;
  }
}
.metric-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0;
  padding-left: 0.4rem;
}

.metric-unit {
  margin-left: 0.2rem;
  font-size: 0.75em;
  color: var(--ion-color-medium);
}

/* アイコンと数値フォントサイズを小さく */
.metric-icon {
  font-size: 1.2rem;
  vertical-align: middle;
  margin-right: 0.2rem;
  padding-bottom: 0.25rem;
}

/* ボタン群 */
.button-group {
  /* フッター内グリッド全体を中央に */
  max-width: 500px;
  margin: 0 auto;
  padding: 0.1rem 1.5rem;
}
.button-group ion-row {
  /* 行単位でも中央寄せ */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  /* 折り返し禁止 */
  flex-wrap: nowrap !important;
}
.small-btn-group {
  /* 小ボタンを縦に並べる */
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin: 0 auto;
  min-width: 1rem;
}
.small-btn-group ion-button {
  /* 「−」「リセット」両ボタンの共通調整 */
  --padding-top:    0.2rem;
  --padding-bottom: 0.2rem;
  --padding-start:  0.4rem;
  --padding-end:    0.4rem;
  font-size: 0.8rem;
}
ion-button {
  /* ボタンの丸みを控えめに */
  --border-radius: 0.4rem;
}

</style>
