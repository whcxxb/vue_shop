import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

//导入全局样式表
import "./assets/css/global.css"

import ZkTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from "axios"
//配置请求根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
//axios.defaults.baseURL = "https://lianghj.top:8888/api/private/v1/"
axios.interceptors.request.use(config=>{
  //console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})
Vue.prototype.$http = axios


Vue.component('tree-table', ZkTable)

Vue.config.productionTip = false

//注册富文本编辑器
Vue.use(VueQuillEditor)
Vue.filter('dateFormat',function(times){
  const dt = new Date(times)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 +"").padStart(2,'0')
  const d = (dt.getDate() + "").padStart(2,'0')

  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
