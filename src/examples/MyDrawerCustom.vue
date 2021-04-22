<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr fff" container style="height: 400px" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-red-9">
        <q-toolbar>
          <q-btn flat round dense icon="menu" @click="drawer = !drawer" />
          <q-toolbar-title>Header</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <my-drawer
        v-model="drawer"
        elevated
        show-if-above
        :breakpoint="500"
        :width="200"
        :limits="[100, 500]"
        content-class="bg-red-1"
        resizerClass="drawer-resizer"
        resizerStyle="width: 6px"
      >
        <template #default>
          <div class="fit no-scroll q-pa-lg">
            <q-icon v-for="n in 7" :key="n" :name="`brightness_${n}`" size="lg" color="red" class="q-ma-md" />
          </div>
        </template>
        <template #resizer>
          <q-btn flat dense icon="arrow_back" color="red-5" size="md" class="absolute-top hide-drawer" @click="drawer = false" />
        </template>
      </my-drawer>

      <q-page-container>
        <q-page padding>
          <p v-for="n in 15" :key="n">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit nihil praesentium molestias a adipisci, dolore vitae odit, quidem
            consequatur optio voluptates asperiores pariatur eos numquam rerum delectus commodi perferendis voluptate?
          </p>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
export default {
  data: () => ({
    drawer: false
  })
}
</script>

<style>
.drawer-resizer {
  background-color: transparent;
  background-image: linear-gradient(#c00, transparent 90%);
}
.hide-drawer {
  margin-top: 15px;
  margin-left: -8px;
}
</style>
