import Vue from 'vue'
import VueRouter from 'vue-router'

const Login = () => import(/* webpackChunkName: "login_home_welome" */ '../components/Login')
const Home = () => import(/* webpackChunkName: "login_home_welome" */ '../components/Home')
const Welcome = () => import(/* webpackChunkName: "login_home_welome" */ '../components/Welcome')

const Users = () => import(/* webpackChunkName: "User" */ '../components/user/Users')

const Rights = () => import(/* webpackChunkName: "power" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "power" */ '../components/power/Roles')

const Categories = () => import(/* webpackChunkName: "goods" */ '../components/goods/Categories')
const Params = () => import(/* webpackChunkName: "goods" */ '../components/goods/Params')
const List = () => import(/* webpackChunkName: "goods" */ '../components/goods/List')
const New = () => import(/* webpackChunkName: "goods" */ '../components/goods/New')


const Order = () => import(/* webpackChunkName: "order" */ '../components/order/Order')
const Report = () => import(/* webpackChunkName: "report" */ '../components/report/Report')



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
      {
        path:'/reports',
        component:Report
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
