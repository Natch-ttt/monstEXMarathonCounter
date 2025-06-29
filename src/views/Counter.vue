<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ item.name }}</ion-title>
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
          <!-- periodがall以外のときだけ表示 -->
          <ion-button
            v-if="period !== 'all'"
            fill="clear"
            class="calendar-btn"
            @click.stop="openPopover($event)"
          >
            <ion-icon slot="icon-only" :icon="currentPeriodIcon" />
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
            <ion-datetime
              v-if="period === 'month'"
              presentation="month-year"
              :value="selectedMonth"
              display-format="YYYY/MM"
              picker-format="YYYY MMMM"
              :year-values="yearValues"
              :min="minMonth"
              :max="maxMonth"
              @ionChange="onMonthPicked"
            />
            <ion-datetime
              v-else
              presentation="date"
              :value="selectedDay"
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
                    <!-- Ionicon か MDI か切り替え -->
                    <template v-if="m.mdi">
                      <i class="material-icons metric-icon">{{ m.mdi }}</i>
                    </template>
                    <template v-else>
                      <ion-icon :icon="m.icon" class="metric-icon" />
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
            <ion-col>
              <ion-button
                shape="round"
                fill="outline"
                expand="block"
                @click="decrement"
                :disabled="pm.runs === 0"
              >
                −
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button
                shape="round"
                color="primary"
                expand="block"
                @click="increment"
              >
                ＋
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button
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
import { useRoute } from 'vue-router'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonBackButton,
  IonContent, IonGrid, IonRow, IonCol, IonModal, IonDatetime, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  alertController
} from '@ionic/vue'
import {
  sparkles, trendingDown, trendingUp, close,
  calendarOutline, calendarSharp, todaySharp
} from 'ionicons/icons'
import { useCounterStore } from '@/stores/counter'

// ルート／ストア
const route = useRoute()
const id = route.params.id as string
const store = useCounterStore()

const today = new Date()

// CounterItem の取得
const item = computed(() => store.getItem(id)!)
if (!item.value) {
  window.location.href = import.meta.env.BASE_URL
}

// 画面上の期間ステート
type Period = 'all' | 'month' | 'day'
const period = ref<Period>('all')
const showPicker     = ref(false)
const popoverEvent   = ref<UIEvent>()

const options: {
  value: Period
  label: string
  icon: any
}[] = [
  { value: 'all',   label: '累計',   icon: calendarOutline },
  { value: 'month', label: '月別',   icon: calendarSharp },
  { value: 'day',   label: '日別', icon: todaySharp }
]

// ポップオーバーに渡すクラスを computed で生成
const popoverClasses = computed<string[]>(() => {
  // month モードなら compact-popover のみ
  if (period.value === 'month') return ['compact-popover']
  // day モードなら compact-popover + wide-popover
  if (period.value === 'day') return ['compact-popover','wide-popover']
  // all モードは開かないはずなので fallback
  return []
})

// 月次：YYYY-MM 文字列生成
const thisMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`
const selectedMonth = ref(thisMonth)

// 日次：YYYY-MM-DD 文字列生成
const todayStr = [
  today.getFullYear(),
  String(today.getMonth()+1).padStart(2,'0'),
  String(today.getDate()).padStart(2,'0')
].join('-')
const selectedDay = ref(todayStr)

// min/max も同様に文字列生成
const startYear = 2000
const minMonth = `${startYear}-01`
const maxMonth = thisMonth

const minDay = `${startYear}-01-01`
const maxDay = todayStr

// yearValues 配列を computed で生成
const currentYear = today.getFullYear()
const yearValues = computed(() => {
  const years: number[] = []
  for (let y = startYear; y <= currentYear; y++) {
    years.push(y)
  }
  return years
})

// ボタン切り替えハンドラ（ポップオープンはしない）
function onPeriodChange(v: Period) {
  period.value = v
}

// ラベル横に出すアイコン（options から拾う）
const currentPeriodIcon = computed(() => {
  const opt = options.find(o => o.value === period.value)
  return opt ? opt.icon : calendarOutline
})

// カレンダーアイコンを押したとき
function openPopover(e: UIEvent) {
  popoverEvent.value = e
  showPicker.value   = true
}
function onPopoverDismiss() {
  showPicker.value   = false
  popoverEvent.value = undefined
}

// 月次ピッカーで選択時
function onMonthPicked(e: CustomEvent) {
  selectedMonth.value = e.detail.value
}
// 日付ピッカーで選択時
function onDayPicked(e: CustomEvent) {
  selectedDay.value = e.detail.value
}

// 画面上で選択中の「年月／日付」を人に読みやすく整形
const currentPeriodLabel = computed(() => {
  if (period.value === 'all') {
    return ''
  }
  if (period.value === 'month') {
    // selectedMonth は "YYYY-MM"
    const [y, m] = selectedMonth.value.split('-')
    return `${y}年${m}月`
  }
  // day モード
  const [yy, mm, dd] = selectedDay.value.split('-')
  return `${yy}年${mm}月${dd}日`
})

// `periodMetrics` で取得した生データ
const pm = computed(() =>
  store.periodMetrics(id, period.value, period.value!=='all'
    ? (period.value==='month' ? selectedMonth.value : selectedDay.value)
    : undefined
  )
)

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

// テンプレート表示用 metrics 配列 
const dispMetrics = computed(() => [
  { label: '周回数',   mdi: 'directions_run',        unit: '周', value: pm.value.runs },
  { label: 'ラック',   icon: sparkles,               unit: '',   value: item.value.encounterCount },
  { label: '遭遇数',   mdi: 'flag',                  unit: '',   value: pm.value.encounters },
  { label: '遭遇率',   mdi: 'percent',               unit: '%',  value: pm.value.encounterRate.toFixed(2) },
  { label: '最短周回', icon: trendingDown,           unit: pm.value.fastest !== null ? '周' : '',  value: pm.value.fastest  ?? '–' },
  { label: '最長周回', icon: trendingUp,             unit: pm.value.slowest  !== null ? '周' : '', value: pm.value.slowest  ?? '–' },
  { label: '平均周回', mdi: 'align_vertical_center', unit: pm.value.average !== null ? '周' : '',  value: pm.value.average?.toFixed(1) ?? '–' },
  { label: '総周回数', mdi: 'history',               unit: '周', value: pm.value.totalRuns },
  { label: 'EX敗北数', icon: close,                  unit: '',   value: pm.value.defeats }
])

// ボタンハンドラ
function increment() { store.incrementRun(id) }
function decrement() { store.decrementRun(id) }

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
          store.onEncounter(id, isNaN(n) ? 0 : n)
        }
      }
    ]
  })
  await alert.present()
}
</script>

<style scoped>
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
}
/* 中のアイコンも小さく */
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
  --ion-grid-column-padding: 0.1rem;  /* 列間 */
  --ion-grid-row-padding:    0.1rem;  /* 行間 */
  margin-bottom: 0.5rem;
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

.metric-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 0;
  padding-left: 0.4rem;
}

.metric-unit {
  margin-left: 0.2rem;
  font-size: 0.75em;  /* 数値に対する相対サイズ */
  color: var(--ion-color-medium); /* 必要なら色も調整 */
}

/* アイコンと数値フォントサイズを小さく */
.metric-icon {
  font-size: 1.2rem;
  vertical-align: middle;
  margin-right: 0.2rem;
  padding-bottom: 0.2rem;
}

/* ボタン群 */
.button-group {
  --ion-grid-column-padding: 0.3rem;
  margin-top: 1.5rem;
}
</style>
