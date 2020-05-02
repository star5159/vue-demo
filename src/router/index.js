import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/users.vue'
import Roles from '../components/power/roles.vue'
import Rights from '../components/power/rights.vue'
import GoodsList from '../components/goods/list.vue'
import Params from '../components/goods/params.vue'
import Categories from '../components/goods/categories.vue'
import AddGoods from '../components/goods/addGoods.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: Users
    }, {
      path: '/roles',
      component: Roles
    }, {
      path: '/rights',
      component: Rights
    }, {
      path: '/goods',
      component: GoodsList
    }, {
      path: '/params',
      component: Params
    }, {
      path: '/categories',
      component: Categories
    }, {
      path: '/goods/addGoods',
      component: AddGoods
    }]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
