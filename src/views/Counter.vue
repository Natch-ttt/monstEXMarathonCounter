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

        <!-- ポップオーバー形式の日付／月選択用カレンダー -->
        <ion-popover
          :is-open="showPicker"
          @did-dismiss="showPicker = false"
          side="bottom"
          alignment="center"
          backdrop-dismiss="true"
          css-class="compact-popover"
        >
          <ion-content class="popover-content">
            <ion-datetime
              v-if="period === 'month'"
              presentation="month-year"
              :value="selectedMonthIso"
              display-format="YYYY/MM"
              picker-format="YYYY MMMM"
              :year-values="yearValues"
              :min="minMonthIso"
              :max="maxMonthIso"
              @ionChange="onMonthPicked"
            />
            <ion-datetime
              v-else
              presentation="date"
              :value="selectedDayIso"
              display-format="YYYY/MM/DD"
              picker-format="YYYY MMMM DD"
              :min="minDayIso"
              :max="maxDayIso"
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
                  <span class="metric-value">{{ m.value }}</span>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- 操作ボタン -->
        <ion-row class="button-group">
          <ion-col>
            <ion-button shape="round" fill="outline" expand="block" @click="decrement">−</ion-button>
          </ion-col>
          <ion-col>
            <ion-button shape="round" color="primary" expand="block" @click="increment">＋</ion-button>
          </ion-col>
          <ion-col>
            <ion-button shape="round" color="tertiary" expand="block" @click="promptEncounter">遭遇</ion-button>
          </ion-col>
        </ion-row>
      </div>
    </ion-content>
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

// CounterItem の取得
const item = computed(() => store.getItem(id)!)
if (!item.value) {
  window.location.href = import.meta.env.BASE_URL
}

// 画面上の期間ステート
type Period = 'all' | 'month' | 'day'
const period = ref<Period>('all')
const showPicker = ref(false) // モーダル表示フラグ
const options: {
  value: Period
  label: string
  icon: any
}[] = [
  { value: 'all',   label: '累計',   icon: calendarOutline },
  { value: 'month', label: '月次',   icon: calendarSharp },
  { value: 'day',   label: '日付別', icon: todaySharp }
]

// 今月の1日を ISO に
const today = new Date()
const firstOfMonthUtc = new Date(Date.UTC(
  today.getFullYear(),
  today.getMonth(),  // 0-based の月
  1                  // 1日
)).toISOString()

// selectedMonthIso: フル ISO
const selectedMonthIso = ref(firstOfMonthUtc)
// 外部ロジック用に YYYY-MM 部分だけ取る
const selectedMonth = computed(() => selectedMonthIso.value.slice(0,7))

// selectedDayIso: ISO 全日
const defaultDayIso = today.toISOString().slice(0,10) + 'T00:00:00.000Z'
const selectedDayIso = ref(defaultDayIso)
const selectedDay    = computed(() => selectedDayIso.value.slice(0,10))

// min/max もフル ISO 形式で
const startYear = 2000
const minMonthIso = startYear + '-01-01T00:00:00.000Z'
const maxMonthIso = new Date().toISOString()
const minDayIso   = startYear + '-01-01T00:00:00.000Z'
const maxDayIso   = new Date().toISOString()

// yearValues 配列を computed で生成
const currentYear = today.getFullYear()
const yearValues = computed(() => {
  const years: number[] = []
  for (let y = startYear; y <= currentYear; y++) {
    years.push(y)
  }
  return years
})

// 切替時：allなら即閉じ／month/dayならモーダルを開く
function onPeriodChange(v: Period) {
  period.value = v
  if (v === 'all') {
    showPicker.value = false
  } else {
    showPicker.value = true
  }
}

// 月次ピッカーで選択時
function onMonthPicked(e: CustomEvent) {
  selectedMonthIso.value = e.detail.value
  // showPicker = false はしない
}
// 日付ピッカーで選択時
function onDayPicked(e: CustomEvent) {
  selectedDayIso.value = e.detail.value
  showPicker.value = false
}

// `periodMetrics` で取得した生データ
const pm = computed(() =>
  store.periodMetrics(
    id,
    period.value,
    period.value === 'month'
      ? selectedMonth.value
      : period.value === 'day'
      ? selectedDay.value
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
  { label: '周回数',    mdi: 'directions_run',       value: `${pm.value.runs}周` },
  { label: 'ラック',    icon: sparkles,              value: item.value.encounterCount },
  { label: '遭遇数',    mdi: 'flag',                 value: pm.value.encounters },
  { label: '遭遇率',    mdi: 'percent',              value: `${pm.value.encounterRate.toFixed(1)}%` },
  { label: '最短周回',   icon: trendingDown,         value: pm.value.fastest  !== null ? `${pm.value.fastest}周` : '–' },
  { label: '最長周回',   icon: trendingUp,           value: pm.value.slowest  !== null ? `${pm.value.slowest}周` : '–' },
  { label: '平均周回', mdi: 'align_vertical_center', value: pm.value.average !== null ? `${pm.value.average.toFixed(1)}周` : '–' },
  { label: '総周回数',  mdi: 'history',              value: `${pm.value.totalRuns}周` },
  { label: 'EX敗北数',   icon: close,                value: pm.value.defeats }
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

/* カレンダーポップオーバー */
.compact-popover {
  --width: 360px;
  --height: auto;
  border-radius: 0.5rem;
}
.compact-popover .modal-content {
  --padding-top:    0.4rem;
  --padding-bottom: 0.4rem;
  --padding-start:  0.4rem;
  --padding-end:    0.4rem;
}
.compact-popover ion-datetime {
  max-width: 340px;
  margin: auto;
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
/* ヘッダーとコンテンツ部分をコンパクトに */
.metric-card::part(header),
.metric-card::part(content) {
  padding-block-start: 0.2rem;   /* 上下の余白 */
  padding-block-end:   0.2rem;
  padding-inline-start:0.4rem;   /* 左右の余白 */
  padding-inline-end:  0.4rem;
}

.metric-value {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
  margin-top: 0.2rem;
}

/* アイコンと数値フォントサイズを小さく */
.metric-icon {
  font-size: 1rem;
  vertical-align: middle;
  margin-right: 0.2rem;
}

/* ボタン群 */
.button-group {
  --ion-grid-column-padding: 0.3rem;
  margin-top: 1.5rem;
}
</style>
