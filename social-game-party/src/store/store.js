/*
Vuex Store
*/
import Vue from 'vue'
import Vuex from 'vuex'
// import SessionInfo from "@/logic/SessionInfo.js";
import { GlobalPropertyModule } from "@/store/GlobalPropertyModule.js";
import { CurrentSessionModule } from "@/store/CurrentSessionModule.js";

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        global: GlobalPropertyModule,
        session: CurrentSessionModule
    },
    state: {

        projectName: 'Social Game Party',

    },
    getters: {

        //Getters
        projectName: state => {
            return state.projectName;
        },

    },
    //Synchronous (Simple setters)
    mutations: {

        setProjectName: (state, payload) => {
            state.projectName = payload;
        },

    },
    //Async (More complex functions)
    actions: {


    },

})
