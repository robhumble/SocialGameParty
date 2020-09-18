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
        isDebugMode: false,

    },
    getters: {

        //Getters
        projectName: state => {
            return state.projectName;
        },

        isDebugMode: state => {
            return state.isDebugMode;
        }

    },
    //Synchronous (Simple setters)
    mutations: {

        setProjectName: (state, payload) => {
            state.projectName = payload;
        },

        setIsDebugMode: (state, payload) => {
            state.isDebugMode = payload;
        }

    },
    //Async (More complex functions)
    actions: {

    },

})
