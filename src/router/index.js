import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "../components/Login"
import Home from "../components/Home"
import Welcome from "../components/Welcome"
import Users from "../components/user/Users"
import Rights from "../components/power/Rights"
import Roles from "../components/power/Roles"
import Categories from "../components/goods/Categories"
import Params from "../components/goods/Params"
import List from "../components/goods/List"
import New from "../components/goods/New"
import Order from "../components/order/Order"


Vue.use(VueRouter)

const routes = [

  //重定向到登录页面
  { path: '/', redirect: '/login' },
  { path: "/login", component: Login },
  {
    path: "/home",
    component: Home,
    //登录home后重新定向到子组件 welcome
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component:Welcome
      },
      {
        path:'/users',
        component:Users
      },
      {
        path:'/rights',
        component:Rights
      },
      {
        path:'/roles',
        component:Roles
      },
      {
        path:'/categories',
        component:Categories
      },
      {
        path:'/params',
        component:Params
      },
      {
        path:'/goods',
        component:List,
      },
      {
        path:'/goods/new',
        component:New
      },
      {
        path:'/orders',
        component:Order
      },
    ]
  }
]


const router = new VueRouter({
  routes
})


router.beforeEach((to, from, next) => {
  //如果用户访问是登录页 放行
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
