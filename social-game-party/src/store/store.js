/*
Vuex Store
*/
import Vue from 'vue'
import Vuex from 'vuex'
import SessionInfo from "@/logic/SessionInfo.js";

Vue.use(Vuex)

export default new Vuex.Store({
    state: {

        projectName: 'Social Game Party',
        currentSession: null

    },
    getters: {

        //Getters
        projectName: state => {
            return state.projectName;
        },

        currentSession: state => {     
            
            if(!state.currentSession)
            {
                let s = new SessionInfo();
                s.loadFromLocalStorage();
                state.currentSession = s;
            }

            return state.currentSession;
        }

    },
    //Synchronous (Simple setters)
    mutations: {

        setProjectName: (state, payload) => {
            state.projectName = payload;
        },

        setCurrentSession: (state, payload) => {
            state.currentSession = payload;
        }

    },
    //Async (More complex functions) 
    actions: {

        /**
         * Update the CurrentSession and write the new session to local storage
         */        
        UpdateCurrentSession:(context, payload) => {
          
            if(payload instanceof SessionInfo)
            {
                payload.saveToLocalStorage();
          
                context.commit('setCurrentSession', payload);
            }
        }
    },
    modules: {
    }
})
