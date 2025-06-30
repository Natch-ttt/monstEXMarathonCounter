import { defineStore } from 'pinia'
import { menuController } from '@ionic/vue'

export type MenuView = 'logs' | 'opts'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    activeView: 'logs' as MenuView
  }),
  actions: {
    // 遭遇ログメニューを開く
    async openLogsMenu() {
      this.activeView = 'logs'
      await menuController.toggle('globalMenu')
    },
    // オプションメニューを開く
    async openOptionMenu() {
      this.activeView = 'opts'
      await menuController.toggle('globalMenu')
    }
  }
})
