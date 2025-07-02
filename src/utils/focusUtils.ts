// utils/focusUtils.ts
export function blurActive() {
  const el = document.activeElement as HTMLElement | null
  if (el && typeof el.blur === 'function') {
    el.blur()
  }
}
