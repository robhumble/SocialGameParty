/*
Vuex Store
*/
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        projectName: 'Social Game Party'
    },
    getters: {
        //Getters
        projectName: state => {
            return state.projectName;
        }
    },
    //Synchronous (Simple setters)
    mutations: {

        setProjectName: (state, payload) => {
            state.projectName = payload;
        }
    },
    //Async (More complex functions) 
    actions: {
        // setProjectName:(context, payload) => {
        //   context.commit('setProjectName',payload);
        // }
    },
    modules: {
    }
})
