// src/plugins/piniaPersist.ts
import type { PiniaPluginContext } from 'pinia'

interface PersistOptions {
  key?: string
  storage?: Storage
}

export function piniaPersistPlugin(
  { store }: PiniaPluginContext,
  options: PersistOptions = {}
) {
  const key = options.key || `pinia-${store.$id}`
  const storage = options.storage || localStorage

  // マウント時にストレートにhydrate
  const fromStorage = storage.getItem(key)
  if (fromStorage) {
    try {
      store.$patch(JSON.parse(fromStorage))
    } catch {}
  }

  // ストアが変わるたびに storage に書き戻す
  store.$subscribe(() => {
    storage.setItem(key, JSON.stringify(store.$state))
  })
}
