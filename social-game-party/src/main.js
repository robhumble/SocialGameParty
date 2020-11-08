import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import store from './store/store.js'
import * as sgf from "@/logic/socialGameFramework.js";

Vue.config.productionTip = false


//Functions, Events, Data defined here will automatically be imported and mixed in to every component in the Vue app.
Vue.mixin({

  methods: {

    /**
     * Quickly log a message, Calls megaLog() with out referencing sgf in any child component.
     * @param {string} msg 
     * @param {boolean} forcePrint - force a console log.
     */
    quickLog: function (msg, forcePrint) {
      sgf.mainFramework.megaLog(msg, forcePrint);
    }

  },

})



new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')


//Vue.config.devTools = true;
