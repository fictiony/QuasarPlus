<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr fff" container style="height: 400px" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-black">
        <q-toolbar>
          <q-btn flat round dense icon="menu" @click="drawerLeft = !drawerLeft" />
          <q-toolbar-title>Header</q-toolbar-title>
          <q-btn flat round dense icon="menu" @click="drawerRight = !drawerRight" />
        </q-toolbar>
      </q-header>

      <my-drawer v-model="drawerLeft" content-class="bg-grey-3" bordered show-if-above :breakpoint="500" :width="160" :limits="[50, 300]">
        <q-scroll-area class="fit">
          <q-list>
            <template v-for="(menuItem, index) in menuList">
              <q-item :key="index" clickable>
                <q-item-section avatar>
                  <q-icon :name="menuItem.icon" />
                </q-item-section>
                <q-item-section>
                  {{ menuItem.label }}
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index" v-if="menuItem.separator" />
            </template>
          </q-list>
        </q-scroll-area>
      </my-drawer>

      <my-drawer v-model="drawerRight" side="right" bordered :breakpoint="0" :width="160" :limits="[160, 300]">
        <q-list class="q-py-sm">
          <q-item v-for="n in 20" :key="n" dense>
            <q-chip icon="bookmark"> Bookmark {{ n }} </q-chip>
          </q-item>
        </q-list>
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
    drawerLeft: false,
    drawerRight: true,
    menuList: [
      {
        icon: 'inbox',
        label: 'Inbox',
        separator: true
      },
      {
        icon: 'send',
        label: 'Outbox',
        separator: false
      },
      {
        icon: 'delete',
        label: 'Trash',
        separator: false
      },
      {
        icon: 'settings',
        label: 'Settings',
        separator: false
      },
      {
        icon: 'help',
        iconColor: 'primary',
        label: 'Help',
        separator: false
      }
    ]
  })
}
</script>
