<template>
  <ion-page>

    <!-- ヘッダー -->
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>
          <div v-if="!editingName">{{ counter?.name }}</div>
          <ion-input
            v-else
            v-model="editedName"
            class="name-input"
            @keyup.enter="saveName"
          />
        </ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="!editingName" fill="clear" @click="startEditing">
            <ion-icon slot="icon-only" :icon="pencilOutline" />
          </ion-button>
          <ion-button v-else fill="clear" @click="saveName">
            <ion-icon slot="icon-only" :icon="checkmarkOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" @click="confirmRemove">
            <ion-icon slot="icon-only" :icon="trashOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- コンテンツ -->
    <ion-content class="ion-padding counter-content">
      <div class="count-display">{{ counter?.count }}</div>

      <div class="button-group">
        <ion-button
          size="large"
          color="medium"
          @click="decrement"
        >
          <ion-icon slot="icon-only" :icon="removeOutline" />
        </ion-button>
        <ion-button
          size="large"
          color="primary"
          @click="increment"
        >
          <ion-icon slot="icon-only" :icon="addOutline" />
        </ion-button>
      </div>

      <ion-button
        expand="block"
        color="tertiary"
        @click="reset"
      >
        リセット
      </ion-button>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonContent, IonButton, IonButtons, IonLabel, 
  IonBackButton, IonInput,
  alertController, toastController, isPlatform, onIonViewWillLeave
} from '@ionic/vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCounterStore } from '@/stores/counter'
import { blurActive } from '@/utils/focusUtils'
import {
  addOutline,
  removeOutline,
  trashOutline,
  pencilOutline,
  checkmarkOutline
} from 'ionicons/icons'

const store = useCounterStore()
const router = useRouter()
const route = useRoute()
const isNative = isPlatform('capacitor') || isPlatform('cordova')

// 1) ID から対象データを取得
const id = route.params.id as string
const counter = computed(() => store.counters.find(c => c.id === id))

// 2) 編集用
const editingName = ref(false)
const editedName = ref('')

// 初期化時に名前セット
onMounted(() => {
  if (!counter.value) {
    // 存在しなければ Home に戻す
    router.replace({ name: 'Home' })
  } else {
    editedName.value = counter.value.name
  }
})

// 3) 操作メソッド
function increment() {
  blurActive()
  store.increment(id)
  showToast('+1')
}

function decrement() {
  blurActive()
  store.decrement(id)
  showToast('-1')
}

function reset() {
  blurActive()
  store.resetCount(id)
  showToast('リセットしました')
}

// 4) 名前編集
function startEditing() {
  blurActive()
  editedName.value = counter.value!.name
  editingName.value = true
}
function saveName() {
  blurActive()
  const n = editedName.value.trim()
  if (n) {
    store.updateName(id, n)
    editingName.value = false
  }
}

// 5) 削除確認
async function confirmRemove() {
  blurActive()
  const alert = await alertController.create({
    header: `「${counter.value?.name}」を削除`,
    message: '本当に削除しますか？',
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      {
        text: '削除',
        role: 'destructive',
        handler: () => {
          store.remove(id)
          router.replace({ name: 'Home' })
        }
      }
    ]
  })
  await alert.present()
}

// 6) 操作通知トースト
async function showToast(msg: string) {
  blurActive()
  const toast = await toastController.create({
    message: msg,
    duration: 500,
    position: 'bottom'
  })
  toast.present()
}
</script>

<style scoped>
.counter-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.count-display {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.name-input {
  --padding-start: 0;
  font-size: 1.1rem;
  max-width: 200px;
  text-align: center;
}
</style>
