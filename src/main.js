import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css' // 全局样式表
import './assets/fonts/iconfont.css' // icon图标样式表

import axios from 'axios'

import VueQuillEditor from 'vue-quill-editor' // 导入富文本编辑器及其样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/' // 配置请求根路径
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.filter('dataFormat', function (timeVal) {
  const date = new Date(timeVal)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2, '0')
  const day = (date.getDay() + 1 + '').padStart(2, '0')
  const hour = (date.getHours() + 1 + '').padStart(2, '0')
  const min = (date.getMinutes() + 1 + '').padStart(2, '0')
  const s = (date.getSeconds() + 1 + '').padStart(2, '0')
  return `${year}-${month}-${day}\n${hour}:${min}:${s}`
})

Vue.use(VueQuillEditor) // 注册全局可用的富文本编辑器组件

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
