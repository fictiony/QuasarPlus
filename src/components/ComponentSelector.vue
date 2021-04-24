<template>
  <div>
    <div class="_bounds" :style="boundingRect" v-if="state.selectingComponents" />
    <q-menu content-style="z-index: 100000000" auto-close touch-position ref="menu" @hide="listComponents = []">
      <q-item clickable dense v-for="(component, index) in listComponents" :key="index" @mouseover="menuHover(index)" @click="menuSelected(index)">
        <q-item-section>{{ component.$options.name }}</q-item-section>
      </q-item>
    </q-menu>
  </div>
</template>

<script>
// 【组件选择器】
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
      if (!val) return
      const rect = this.getBoundingRect(val[0].$el)
      this.boundingRect = {
        left: rect.x + 'px',
        top: rect.y + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px'
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
          component = [...this.findInnerComponents(component).reverse(), ...this.findOuterComponents(component)]
          if (component.length === 0) {
            component = null
          }
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
          this.state.editingComponent = this.state.selectingComponents[0]
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
      this.state.editingComponent = this.listComponents[index]
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

    // 查找所有外层组件（仅限API表中已声明过的）
    findOuterComponents(component) {
      const components = []
      while (component) {
        if (component.$options.name in this.state.apiMap) {
          if (this.hitTest(component.$el, this.mousePos)) {
            components.push(component)
          }
        }
        component = component.$parent
      }
      return components
    },

    // 查找所有内层组件（仅限API表中已声明过的）
    findInnerComponents(component) {
      const components = []
      const childQueue = [...component.$children]
      while (childQueue.length > 0) {
        component = childQueue.pop()
        if (component.$options.name in this.state.apiMap) {
          if (this.hitTest(component.$el, this.mousePos)) {
            components.push(component)
          }
        }
        childQueue.push(...component.$children)
      }
      return components
    },

    // 获取元素范围框
    getBoundingRect(el) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) return rect

      // 若自身宽高为0，则取子元素范围之和
      let { left, top, right, bottom } = rect
      Array(...el.children).forEach(child => {
        const childRect = this.getBoundingRect(child)
        left = Math.min(left, childRect.left)
        top = Math.min(top, childRect.top)
        right = Math.max(right, childRect.right)
        bottom = Math.max(bottom, childRect.bottom)
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
      const { x, y, width, height } = this.getBoundingRect(el)
      return pt.x >= x && pt.x < x + width && pt.y >= y && pt.y < y + height
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
