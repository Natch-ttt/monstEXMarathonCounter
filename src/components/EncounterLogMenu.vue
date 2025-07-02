<template>
  <ion-header>
    <ion-toolbar class="encounter-log-toolbar">
      <ion-title slot="start" class="ion-text-start">
        <span class="log-title">遭遇ログ</span>
        <span class="current-period">{{ headerPeriodLabel }}</span>
      </ion-title>
      <ion-buttons slot="end">
        <!-- ソートトグル -->
        <ion-button fill="clear" size="default" class="sort-button" @click="toggleEncounterSort">
          <FontAwesomeIcon :icon="encounterSortAsc ? faSortUp : faSortDown" />
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>
    <!-- Counter.vue からピックアップしたログ表示部をここへ -->
    <ion-list>
      <ion-item
        v-for="log in sortedEncounterLogs"
        :key="log.timestamp"
        lines="full"
      >
        <ion-label slot="start" class="log-seq">
          {{ log.seq }}
        </ion-label>
        <ion-label class="log-content">
          <div class="log-header">
            {{ formatDate(log.timestamp) }} ：{{ log.runs }}周
          </div>
          <div class="log-body">
            <span>収集数：{{ log.collected }}</span>
            <span>ラック：{{ log.luck - log.collected }} → {{ log.luck }}</span>
          </div>
        </ion-label>
      </ion-item>
      <ion-item v-if="sortedEncounterLogs.length === 0" lines="none">
        <ion-label>まだ記録がありません</ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonHeader, IonToolbar, IonTitle,
         IonButtons, IonButton, IonContent,
         IonList, IonItem, IonLabel,  menuController
} from '@ionic/vue'
import { useRoute } from 'vue-router'
import { useCounterStore } from '@/stores/counter'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons'

// ソートフラグ
const encounterSortAsc = ref(true)

// ルートで store・ID を共有
const route = useRoute()
const id = computed(() => route.params.id as string)

// ストア／期間データ取得
const store = useCounterStore()
const period = computed(() => store.period)
const selectedMonth = computed(() => store.selectedMonth)
const selectedDay = computed(() => store.selectedDay)
const rawLogs = computed(() => store.getNumberedLogs(id.value))

// ヘッダーラベルを管理
const headerPeriodLabel = computed(() => {
  if (period.value === 'all') {
    return ''
  }
  if (period.value === 'month') {
    const [y,m] = selectedMonth.value.split('-')
    return `${y}年${m}月`
  }
  // day
  const [y, m, d] = selectedDay.value.split('-')
  return `${y}年${m}月${d}日`
})

// ソート済み・連番付きログリスト
const sortedEncounterLogs = computed(() => {
  const arr = [...rawLogs.value]
  arr.sort((a, b) =>
    encounterSortAsc.value
      ? a.timestamp - b.timestamp
      : b.timestamp - a.timestamp
  )
  return arr;
})

// トグル関数
function toggleEncounterSort() {
  encounterSortAsc.value = !encounterSortAsc.value
}

async function onMenuOpen() {
  // ダミーでもいいので value を一度参照
  console.log('menu opened logs=', rawLogs.value)
}

// 日付フォーマット
function formatDate(ts: number) {
  const d = new Date(ts)
  return d.toLocaleDateString() + ' ' +
         d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
}

</script>

<style scoped>
.period-header {
  display: flex;
  justify-content: center;
  align-items: baseline; /* タイトルとperiodをベースライン揃え */
  gap: 0.5rem;           /* タイトルとperiodの間 */
  height: 1.8rem;
}
.log-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-right: 0.5rem;
}
.current-period {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ion-color-primary);
}

.sort-button {
  margin-right: 1rem;
  /* 強調スタイル */
  border:       1px solid var(--ion-color-medium);
  box-shadow:   0 3px 3px rgba(0, 0, 0, 0.15);
  transition:   background-color 0.2s, box-shadow 0.2s;
  cursor:       pointer;
  padding:      0.1rem;
  margin-left:  0.7rem;
  border-radius: 0.2rem;
}

ion-item ion-label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.log-header {
  font-weight: 600;
}
.log-seq {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  text-align: right;
  margin-right: 0.5rem;
  max-width: 1.8rem;
  margin-right: 1.2rem;
}
.log-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.log-meta {
  font-size: 0.9rem;
  color: var(--ion-color-primary);
  font-weight: 500;
}
.log-body {
  display: flex; /* 横並びに */
  align-items: center;
  gap: 0.6rem; /* 1rem の隙間 */
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}
.log-body .collected,
.log-body .luck {
  white-space: nowrap;  /* 折り返さない */
}

</style>
