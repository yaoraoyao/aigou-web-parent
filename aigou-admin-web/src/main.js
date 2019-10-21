import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'

import 'font-awesome/css/font-awesome.min.css'
//卸载mock
// import Mock from './mock'
// Mock.bootstrap();
//全局配置axios
import axios from 'axios'
axios.defaults.baseURL = "http://localhost:9527/services"//网关
Vue.prototype.$http = axios

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

//引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor);



//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes:routes
})
//每次路由之前做的事情
router.beforeEach((to, from, next) => {
  //NProgress.start();
  //如果将要跳转的是登录页面，将session中存储的user信息删除掉
  if (to.path == '/login') {
    sessionStorage.removeItem('user');
  }
  //从session中获取user信息（对象）
  let user = JSON.parse(sessionStorage.getItem('user'));
  //!user 没有user-没有登录过   &&  访问的路径不是登录页面
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router:router,
  store,
  //components: { App }
  render: function(h){
    return h(App);
  }
}).$mount('#app')

