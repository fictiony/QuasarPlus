import Vue from 'vue'
import { extend, LocalStorage } from 'quasar'
import cfg from '../../package.json'

const arrayProto = Array.prototype

// 判断给定值是否为对象（不含null）
export function isObject (val) {
  return typeof val === 'object' && val !== null
}
Vue.prototype.$isObject = isObject

// 判断对象是否为空（含null，非对象也视作空）
export function isEmpty (obj) {
  if (!isObject(obj)) return true
  for (const i in obj) {
    if (i !== undefined) return false
  }
  return true
}
Vue.prototype.$isEmpty = isEmpty

// 克隆对象
export function clone (obj) {
  return extend(true, {}, { obj }).obj
}
Vue.prototype.$clone = clone

// 对象数组转映射表
// - @keyName 要用作键的属性名（null表示数据项本身）
// - @value 若指定，则用作键值（若为函数，则格式为：(数据项, 序号) => 键值），否则键值为数据项本身
export function arrToMap (arr, keyName = 'id', value) {
  const map = {}
  const hasValue = arguments.length > 2
  const isFunc = value instanceof Function
  arr.forEach((item, index) => {
    const key = keyName != null ? item[keyName] : item
    if (hasValue) {
      item = isFunc ? value(item, index) : value
    }
    map[key] = item
  })
  return map
}
Object.defineProperty(arrayProto, 'toMap', {
  value: function () {
    return arrToMap(this, ...arguments)
  }
})

// 对象数组排序
// - @keyName 要用作排序值的属性名
// - @desc 是否倒序
export function arrSortBy (arr, keyName = 'id', desc = false) {
  return arr.sort((a, b) => {
    const va = a[keyName]
    const vb = b[keyName]
    return va > vb ? (desc ? -1 : 1) : va < vb ? (desc ? 1 : -1) : 0
  })
}
Object.defineProperty(arrayProto, 'sortBy', {
  value: function () {
    return arrSortBy(this, ...arguments)
  }
})

// 加载配置信息
// - @name 配置项名称
// - @return 配置数据
export function loadConfig (name) {
  if (LocalStorage.has(cfg.name + '.' + name)) {
    return LocalStorage.getItem(cfg.name + '.' + name)
  }
}
Vue.prototype.$loadConfig = loadConfig

// 保存配置信息
// - @name 配置项名称
// - @data 配置数据
export function saveConfig (name, data) {
  LocalStorage.set(cfg.name + '.' + name, data)
}
Vue.prototype.$saveConfig = saveConfig
