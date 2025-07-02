<!-- src/components/CounterItemLabel.vue -->
<template>
  <ion-label class="counter-label">
    <h2>{{ name }}</h2>
    <p>
      <span>周回数: {{ item.currentRunCount }}</span>
      <span>ラック: {{ item.encounterCount }}</span>
      <span>総周回数: {{ item.runCount }}</span>
    </p>
  </ion-label>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { IonLabel } from '@ionic/vue'
import type { CounterItem }       from '@/stores/counter'

const props = defineProps<{ item: CounterItem }>()

const name = computed(() => props.item.name)

</script>

<style scoped>
.counter-label h2{
  font-weight: 600;
}
.counter-label span{
  margin-right: 1rem;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}
</style>
