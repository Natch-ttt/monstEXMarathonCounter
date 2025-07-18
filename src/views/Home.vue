<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>【モンスト】周回カウンター</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onAdd">
            <ion-icon :icon="addOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="ion-padding">
      <div class="content-wrapper">
        <ion-list v-if="counterStore.counters.length">
          <template v-for="item in counterStore.counters" :key="item.id">
            <!-- デスクトップだけ横並びボタン -->
            <div v-if="isDesktop" class="item-wrapper">
              <ion-item class="flex-item" button detail @click="goCounter(item.id)">
                <CounterItemLabel :item="item" />
              </ion-item>
              <ion-button fill="clear" @click="editTitle(item)">
                <ion-icon slot="icon-only" :icon="pencil" />
              </ion-button>
              <ion-button fill="clear" color="danger"
                          @click.stop.prevent="confirmRemove(item.id, item.name)">
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-button>
            </div>

            <!-- デスクトップ以外はスライド -->
            <ion-item-sliding v-else>
              <ion-item button detail @click="goCounter(item.id)">
                <CounterItemLabel :item="item" />
              </ion-item>
              <ion-item-options side="end">
                <ion-item-option color="light" @click="editTitle(item)">
                  <ion-icon slot="icon-only" :icon="pencil" />
                </ion-item-option>
                <ion-item-option color="danger"
                  @click="confirmRemove(item.id, item.name)">
                  <ion-icon slot="icon-only" :icon="trashOutline" />
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </template>
        </ion-list>

        <div v-else class="empty-state">
          <ion-icon :icon="warningOutline" size="large" />
          <p>
            カウンターがありません<br />
            「＋」をタップして新規作成してください
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonContent, IonButton, IonButtons, IonItemSliding, 
  IonList, IonItem, IonItemOption, IonItemOptions,
  alertController, isPlatform, onIonViewWillLeave
} from '@ionic/vue'
import { addOutline, trashOutline, warningOutline, pencil } from 'ionicons/icons'
import { useCounterStore } from '@/stores/counter'
import { useSettingsStore } from '@/stores/settings'
import { useRoute, useRouter } from 'vue-router'
import { blurActive } from '@/utils/focusUtils'
import CounterItemLabel from '@/components/CounterItemLabel.vue'

const route = useRoute()
const router = useRouter()
const counterStore  = useCounterStore()
const settingsStore = useSettingsStore()

// desktopか判定
const isDesktop = isPlatform('desktop')

async function goCounter(id: string) {
  // settingsStore に currentId をセット
  settingsStore.setCurrentId(id)

  // CounterView または OptionMenuView に遷移
  router.push({ name: 'Counter', params: { id } })
}

// デフォルト名を算出
function getDefaultName() {
  const idx = counterStore.counters.length + 1
  // 3 桁ゼロ埋め
  return `データ${String(idx).padStart(3, '0')}`
}

// 新規作成
async function onAdd() {
  // alert インスタンスを外部参照できるように宣言
  blurActive()
  let theAlert: HTMLIonAlertElement
  theAlert = await alertController.create({
    header: '新規カウンター作成',
    inputs: [
      {
        name: 'name',
        type: 'text',
        // デフォルト値をセット
        value: getDefaultName(),
        placeholder: '例）禁忌【深淵】_不可思議',
      }
    ],
    backdropDismiss: false,
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      {
        text: '作成',
        handler: (d) => {
          const n = (d.name as string)?.trim()
          // バリデート：空文字ならメッセージを表示
          if (!n) {
            theAlert.message = '※ 名前を入力してください'
            return false
          }
          counterStore.add(n)
        }
      }
    ]
  })
  await theAlert.present()
}

// タイトル編集ダイアログ
async function editTitle(item: { id: string; name: string }) {
  const alert = await alertController.create({
    header: 'カウンター名を編集',
    inputs: [
      {
        name: 'name',
        type: 'text',
        value: item.name,
        placeholder: '新しい名前'
      }
    ],
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      {
        text: '保存',
        handler: (data: any) => {
          const n = data.name?.trim()
          if (n) {
            counterStore.updateName(item.id, n)
          }
        }
      }
    ]
  })
  await alert.present()
}

// 項目削除
async function confirmRemove(id: string, name: string) {
  blurActive()
  const alert = await alertController.create({
    header: `「${name}」を削除`,  // ヘッダーにタイトルを埋め込む
    message: '本当に削除しますか？',
    buttons: [
      { text: 'キャンセル', role: 'cancel' },
      {
        text: '削除',
        role: 'destructive',
        handler: () => {
          // カウンター本体を削除
          counterStore.remove(id)
          // オプション設定も削除
          settingsStore.removeSettings(id)
        }
      }
    ]
  })
  await alert.present()
}

onIonViewWillLeave(() => {
  // フォーカス中の要素があれば外す
  (document.activeElement as HTMLElement)?.blur()
})
</script>

<style scoped>
/* 中央寄せ＋幅制限をやや狭く */
.content-wrapper {
  max-width: 600px;
  margin: 0 auto 2rem;
}

.empty-state {
  text-align: center;
  color: var(--ion-color-medium);
  margin-top: 20vh;
}
.empty-state p {
  margin-top: 1rem;
  line-height: 1.4;
}

/* Web版: リスト項目＋ボタンを横並びに */
.item-wrapper {
  display: flex;
  align-items: center;
  /* 項目間のスペース */
  margin-bottom: var(--ion-item-margin-bottom, 0.25rem);
}

/* ion-item を横幅いっぱいに伸ばす */
.flex-item {
  flex: 1;
}
/* 編集ボタン */
.edit-button {
  /* 余白 */
  margin-left: 0.5rem;
  /* アイコンを少し強調 */
  --color: #015796;
}
/* 削除ボタン */
.delete-button {
  /* 余白 */
  margin-left: 0.5rem;
  /* アイコンを少し強調 */
  --color: #ad000d;
}

</style>
