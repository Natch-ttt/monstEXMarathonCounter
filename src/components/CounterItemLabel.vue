<template>
  <ion-label>
    <h2>{{ name }}</h2>
    <p>{{ count }} 回</p>
  </ion-label>
</template>

<script setup lang="ts">
interface Props {
  name: string
  count: number
}
const props = defineProps<Props>()
</script>
