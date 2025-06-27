<template>
  <ion-label>
    <h2>{{ props.name }}</h2>
    <p>{{ props.count }} 回</p>
  </ion-label>
</template>

<script setup lang="ts">
import { IonLabel } from '@ionic/vue'
interface Props {
  name: string
  count: number
}
const props = defineProps<Props>()
</script>
