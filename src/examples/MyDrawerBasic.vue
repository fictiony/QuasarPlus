<template>
  <my-splitter style="height: 300px" :limits2="[100, 200]">
    <template #before>
      <div class="q-pa-md">
        <div class="text-h4 q-mb-md">Before</div>
        <div v-for="n in 20" :key="n" class="q-my-md">
          {{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam
          possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.
        </div>
      </div>
    </template>
    <template #after>
      <div class="q-pa-md">
        <div class="text-h4 q-mb-md">After</div>
        <div v-for="n in 20" :key="n" class="q-my-md">
          {{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam
          possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.
        </div>
      </div>
    </template>
  </my-splitter>
</template>
