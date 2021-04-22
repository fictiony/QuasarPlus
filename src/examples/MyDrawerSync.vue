<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr fff" container style="height: 300px" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-black">
        <q-toolbar>
          <q-btn flat round dense icon="menu" @click="drawer = !drawer" />
          <q-toolbar-title>Header</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <my-drawer v-model="drawer" elevated show-if-above :breakpoint="500" :width.sync="drawerWidth" :limits="[drawerLimits.min, drawerLimits.max]">
        <div class="q-pa-lg">This is the Drawer</div>
      </my-drawer>

      <q-page-container>
        <q-page class="q-pa-lg bg-grey-2">
          <div class="row no-wrap">
            <div class="q-mr-md">Width:</div>
            {{ drawerWidth }}
          </div>
          <div class="row no-wrap q-pt-xl">
            <div class="q-mr-md">Limits:</div>
            <q-range label-always v-model="drawerLimits" :min="50" :max="600" />
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
    drawerWidth: 200,
    drawerLimits: {
      min: 100,
      max: 300
    }
  })
}
</script>
