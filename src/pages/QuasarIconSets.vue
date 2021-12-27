<template>
  <q-page padding class="column">
    <q-resize-observer debounce="0" @resize="refreshRowIconNum" />

    <q-toolbar class="q-pa-none" style="padding-bottom: 10px">
      <q-btn-dropdown
        class="q-mr-sm"
        style="width: 200px"
        glossy
        no-caps
        auto-close
        color="primary"
        align="between"
        menu-anchor="bottom left"
        menu-self="top left"
        :label="iconSetLabel"
      >
        <q-list dense>
          <q-item v-for="(option, index) in iconSetOptions" :key="index" clickable @click="selectIconSet(option.value)">
            <q-item-section class="q-space">{{ option.label }}</q-item-section>
            <q-item-section class="text-grey" side>{{ option.icons.length }}项</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-input style="width: 200px" dense outlined clearable v-model="searchWord" placeholder="输入图标名搜索" :debounce="0">
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="row items-center no-wrap text-no-wrap text-primary" v-if="selectedIcon">
        <q-separator spaced vertical />
        <q-icon :name="selectedIcon.name" :size="iconSize + 'px'" />
        <q-separator spaced vertical />
        <div>
          <b class="text-grey" style="font-size: 9px">{{ selectedIcon.iconSet }}</b>
          <br />
          {{ selectedIcon.name }}
        </div>
        <q-separator spaced vertical />
      </div>

      <q-space />

      <div class="row items-center no-wrap text-no-wrap text-grey">
        <q-slider class="q-mx-md" style="width: 100px" snap :min="16" :max="64" :step="8" v-model="iconSize" />
        {{ iconSize }}px
      </div>
    </q-toolbar>

    <q-virtual-scroll
      class="full-width q-space"
      style="height: 100px; overflow-x: hidden"
      flat
      bordered
      type="table"
      separator="cell"
      :virtual-scroll-item-size="iconSize + 13"
      :items="slicedIcons"
    >
      <template v-slot="{ item }">
        <tr>
          <td v-for="i in rowIconNum" :key="i" class="text-center" style="padding: 6px; height: 1px">
            <IconPreview
              :name="item[i - 1].name"
              :icon-set="iconSet ? '' : item[i - 1].iconSet"
              :size="iconSize"
              v-if="item[i - 1]"
              @click="onSelect(item[i - 1])"
            />
            <div :style="{ width: iconSize + 'px' }" v-else />
          </td>
        </tr>
      </template>
    </q-virtual-scroll>
  </q-page>
</template>

<script>
// 【Quasar 图标集】

// 图标集
const ICON_SETS = [
  { label: '所有图标', value: '' },
  { label: 'Material 填充图标集', value: 'material-icons' },
  { label: 'Material 描边图标集', value: 'material-icons-outlined' },
  { label: 'Material 圆角图标集', value: 'material-icons-round' },
  { label: 'Material 方角图标集', value: 'material-icons-sharp' },
  { label: 'Bootstrap 图标集', value: 'bootstrap-icons' },
  { label: 'Themify 图标集', value: 'themify' },
  { label: 'Fontawesome 图标集', value: 'fontawesome-v5' },
  { label: 'Line-awesome 图标集', value: 'line-awesome' },
  { label: 'Eva 图标集', value: 'eva-icons' },
  { label: 'Ion 图标集', value: 'ionicons-v4' },
  { label: 'MDI 图标集', value: 'mdi-v5' }
]

export default {
  data: vm => ({
    searchWord: null, // 搜索词
    iconSet: vm.getRouteIconSet(), // 当前图标集
    iconSize: 40, // 当前图标大小
    rowWidth: 100, // 行宽度
    rowIconNum: 10, // 一行中的图标数量
    selectedIcon: null // 当前选中的图标信息
  }),

  computed: {
    // 图标集选项表
    iconSetOptions() {
      let allOption = null
      const allIcons = []
      const options = ICON_SETS.map(info => {
        const option = { ...info }
        let icons = []
        if (info.value) {
          try {
            icons = require('components/icon-set/' + info.value + '.js').default.icons.map(i => ({
              name: (i.prefix ? i.prefix + ' ' : '') + i.name,
              iconSet: info.value
            }))
          } catch (e) {
            console.error(`load icon set '${info.value}' fail: ${e}`)
          }
          allIcons.push(...icons)
          option.icons = Object.freeze(icons.sortBy('name'))
        } else {
          allOption = option
        }
        return option
      })
      if (allOption) {
        allOption.icons = Object.freeze(allIcons.sortBy('name'))
      }
      return options
    },

    // 当前图标集标题
    iconSetLabel() {
      const iconSet = ICON_SETS.find(i => i.value === this.iconSet)
      return (iconSet && iconSet.label) || '未知'
    },

    // 当前图标列表
    icons() {
      const iconSet = this.iconSetOptions.find(i => i.value === this.iconSet)
      return iconSet && iconSet.icons
    },

    // 筛选后的图标列表
    filteredIcons() {
      return Object.freeze(this.icons.filter(info => this.matchFilter(info)).sortBy('name'))
    },

    // 按行切分后的图标列表
    slicedIcons() {
      const icons = []
      for (let i = 0; i < this.filteredIcons.length; i += this.rowIconNum) {
        icons.push(this.filteredIcons.slice(i, i + this.rowIconNum))
      }
      return Object.freeze(icons)
    },

    // 处理后的实际搜索词
    realSearchWord() {
      return (this.searchWord || '').trim().toLowerCase()
    }
  },

  watch: {
    $route() {
      this.iconSet = this.getRouteIconSet()
    },

    iconSize(val) {
      this.$saveConfig('iconSize', val)
      this.refreshRowIconNum()
    }
  },

  methods: {
    // 获取当前路由图标集
    getRouteIconSet() {
      const iconSet = ICON_SETS.find(i => i.value === this.$route.params.iconSet)
      return iconSet ? iconSet.value : ''
    },

    // 选择图标集
    selectIconSet(iconSet) {
      this.iconSet = iconSet
      if (iconSet !== (this.$route.params.iconSet || '')) {
        this.$router.replace(`/QuasarIconSets/${iconSet}`)
      }
    },

    // 判断是否满足筛选条件
    matchFilter(info) {
      if (this.realSearchWord) {
        return info.name.toLowerCase().includes(this.realSearchWord)
      }
      return true
    },

    // 刷新每行图标数量
    refreshRowIconNum(size) {
      if (size) {
        this.rowWidth = size.width
      }
      this.rowIconNum = Math.floor((this.rowWidth - 25) / (this.iconSize + 20))
    },

    // 选中图标
    onSelect(icon) {
      this.selectedIcon = this.selectedIcon === icon ? null : icon
    }
  },

  mounted() {
    // 读取配置
    this.iconSize = this.$loadConfig('iconSize') || 40
  }
}
</script>
