<template>
  <div>
    <div class="_bounds" :style="boundingRect" v-if="state.selectingComponents" />
    <q-menu content-style="z-index: 100000000" auto-close touch-position ref="menu" @hide="listComponents = []">
      <q-list dense>
        <q-item clickable key="_" @mouseover="menuHover(0)" @click="menuSelected(0)" v-if="listComponents[0]">
          <q-item-section>{{ $getName(listComponents[0].component.$options) }}</q-item-section>
        </q-item>
        <q-separator />
        <q-item
          clickable
          v-for="(item, index) in [...listComponents].reverse()"
          :key="index"
          @mouseover="menuHover(listComponents.length - index - 1)"
          @click="menuSelected(listComponents.length - index - 1)"
        >
          <q-item-section :style="{ paddingLeft: item.level * 12 + 'px' }">{{ $getName(item.component.$options) }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script>
// 【组件选择器】
const EMPTY_RECT = { x: 0, y: 0, width: 0, height: 0 }

export default {
  data: () => ({
    mousePos: {},
    boundingRect: {},
    listComponents: []
  }),

  inject: ['state'],

  watch: {
    // 开启/关闭选择时，添加/删除鼠标事件
    'state.selecting'(val) {
      if (!val) {
        this.state.selectingComponents = null
      }
      const method = `${val ? 'add' : 'remove'}EventListener`
      const ignoreEvents = ['mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousedown', 'mouseup']
      window[method]('mouseover', this.elementMouseOver, true)
      window[method]('click', this.elementClicked, true)
      ignoreEvents.forEach(event => {
        window[method](event, this.cancelEvent, true)
      })
    },

    // 选中组件时，刷新高亮范围框
    'state.selectingComponents'(val) {
      if (val) {
        if (!this.refreshTimer) {
          this.refreshTimer = setInterval(this.refreshBoundingRect, 20)
        }
      } else if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = undefined
      }
    }
  },

  methods: {
    // 避免事件上抛
    cancelEvent(e) {
      if (this.listComponents.length > 0) return
      e.stopImmediatePropagation()
      e.preventDefault()
    },

    // 鼠标滑过DOM元素
    elementMouseOver(e) {
      if (this.listComponents.length > 0) return
      this.cancelEvent(e)
      this.mousePos = {
        x: e.clientX,
        y: e.clientY
      }

      // 查找鼠标下的组件
      let component = this.findComponent(e.target)
      if (component) {
        if (!this.$parent.$el.contains(component.$el)) {
          // 仅限内页中的组件
          component = null
        } else {
          // 内外层遍历
          const outer = this.findOuterComponents(component)
          const middle = outer[0] || { component }
          const inner = this.findInnerComponents(middle.component, middle.level)
          const all = [...inner.reverse(), ...outer]
          component = all.length > 0 ? this.normalizeLevels(all) : null
        }
      }
      this.state.selectingComponents = component
    },

    // 鼠标点击DOM元素
    elementClicked(e) {
      if (this.listComponents.length > 0) return
      this.cancelEvent(e)
      if (this.state.selectingComponents) {
        if (this.state.selectingComponents.length > 1) {
          this.listComponents = this.state.selectingComponents
          this.$refs.menu.show(e)
          return
        } else {
          this.state.editingComponent = this.state.selectingComponents[0].component
        }
      } else {
        this.state.editingComponent = null
      }
      this.state.selecting = false
    },

    // 菜单悬停
    menuHover(index) {
      this.state.selectingComponents = [this.listComponents[index]]
    },

    // 菜单选中
    menuSelected(index) {
      this.state.editingComponent = this.listComponents[index].component
      this.listComponents = []
      this.state.selecting = false
    },

    // 查找Vue组件
    findComponent(el) {
      while (el && !el.__vue__) {
        el = el.parentElement
      }
      return el && el.__vue__
    },

    // 查找所有外层组件（仅限内页中的组件）
    findOuterComponents(component, level = 0) {
      const outer = []
      while (component) {
        if (this.hitTest(component.$el, this.mousePos)) {
          outer.push({ component, level })
        }
        component = component.$parent
        if (component === this.$parent || !this.$parent.$el.contains(component.$el)) break
        level--
      }
      return outer
    },

    // 查找所有内层组件
    findInnerComponents(component, level = 0) {
      const inner = []
      const childQueue = [...component.$children]
      const levelQueue = component.$children.map(() => level + 1)
      while (childQueue.length > 0) {
        component = childQueue.pop()
        level = levelQueue.pop()
        if (this.hitTest(component.$el, this.mousePos)) {
          inner.push({ component, level })
        }
        childQueue.push(...component.$children)
        levelQueue.push(...component.$children.map(() => level + 1))
      }
      return inner
    },

    // 矫正层级
    normalizeLevels(list) {
      const minLevel = list[list.length - 1].level
      return list.map(i => ({
        component: i.component,
        level: i.level - minLevel
      }))
    },

    // 获取元素范围框
    getBoundingRect(el) {
      if (!el.getBoundingClientRect) return null
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) return rect

      // 若自身宽高为0，则取子元素范围之和
      let { left, top, right, bottom } = rect
      Array(...el.children).forEach(child => {
        const childRect = this.getBoundingRect(child)
        if (childRect) {
          left = Math.min(left, childRect.left)
          top = Math.min(top, childRect.top)
          right = Math.max(right, childRect.right)
          bottom = Math.max(bottom, childRect.bottom)
        }
      })
      return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top
      }
    },

    // 判断坐标是否在元素内
    hitTest(el, pt) {
      const { x, y, width, height } = this.getBoundingRect(el) || EMPTY_RECT
      return pt.x >= x && pt.x < x + width && pt.y >= y && pt.y < y + height
    },

    // 刷新范围框
    refreshBoundingRect() {
      const rect = this.getBoundingRect(this.state.selectingComponents[0].component.$el) || EMPTY_RECT
      this.boundingRect = {
        left: rect.x + 'px',
        top: rect.y + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px'
      }
    }
  },

  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  }
}
</script>

<style lang="scss" scoped>
._bounds {
  position: fixed;
  z-index: 99999999;
  pointer-events: none;
  background-color: #ff660033;
}
</style>
