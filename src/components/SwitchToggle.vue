<!-- src/components/SwitchToggle.vue -->
<template>
  <label class="switch">
    <input type="checkbox" :checked="modelValue" @change="onChange" />
    <span class="slider"></span>
    <span class="label-text">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  modelValue: boolean
  label?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

function onChange(e: Event) {
  const el = e.target as HTMLInputElement
  emit('update:modelValue', el.checked)
}
</script>

<style scoped>
.switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: relative;
  width: 40px;
  height: 20px;
  background: #ccc;
  border-radius: 20px;
  margin-right: 0.5em;
  transition: background 0.3s;
}
.slider::before {
  content: '';
  position: absolute;
  width: 16px; height: 16px;
  left: 2px; top: 2px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}
.switch input:checked + .slider {
  background: var(--ion-color-primary, #3880ff);
}
.switch input:checked + .slider::before {
  transform: translateX(20px);
}
.label-text {
  user-select: none;
}
</style>
