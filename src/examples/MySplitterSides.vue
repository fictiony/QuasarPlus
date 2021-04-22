<template>
  <my-splitter style="height: 300px" unit="px" :limits2="[100, 150]" :position="200">
    <template #before>
      <div class="q-pa-md">
        <div class="text-h4 q-mb-md">Left</div>
        <div v-for="n in 20" :key="n" class="q-my-md">
          {{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam
          possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.
        </div>
      </div>
    </template>
    <template #after>
      <my-splitter unit="px" :limits2="[50, 100]" :position="200" reverse>
        <template #before>
          <div class="q-pa-md">
            <div class="text-h4 q-mb-md">Middle</div>
            <div v-for="n in 20" :key="n" class="q-my-md">
              {{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.
            </div>
          </div>
        </template>
        <template #after>
          <div class="q-pa-md">
            <div class="text-h4 q-mb-md">Right</div>
            <div v-for="n in 20" :key="n" class="q-my-md">
              {{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.
            </div>
          </div>
        </template>
      </my-splitter>
    </template>
  </my-splitter>
</template>
