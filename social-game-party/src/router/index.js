import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Experimental from '../views/Experimental.vue'

Vue.use(VueRouter)

//   const routes = [
//   {
//     path: '/',
//     name: 'Home',
//     component: Home
//   },
//   {
//     path: '/about',
//     name: 'About',
//     // route level code-splitting
//     // this generates a separate chunk (about.[hash].js) for this route
//     // which is lazy-loaded when the route is visited.
//     component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
//   }
// ]

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/debugParty', name: 'Home', component: Home, props: { isDebug: true } },

  { path: '/about', name: 'About', component: About },


  //Don't add public links to these
  { path: '/experimental', name: 'ExperimentalPage', component: Experimental, props: { isDebug: true } },

]

const router = new VueRouter({
  routes
})

export default router
