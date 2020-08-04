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
                s.saveToLocalStorage();
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
        },

        UpdateCurrentUserDisplayName:(context, payload) => {
          
            if(typeof payload === 'string' && context.state.currentSession)
            {
                context.state.currentSession.currentUser.name = payload;
                context.state.currentSession.saveToLocalStorage();
            }
        },

        UpdateCurrentUserUniqueId:(context, payload) => {
          
            if(typeof payload === 'number' && context.state.currentSession)
            {
                context.state.currentSession.currentUser.uniqueId = payload;
                context.state.currentSession.saveToLocalStorage();
            }
        },

        UpdateCurrentRoomName:(context, payload) => {
          
            if(typeof payload === 'string' && context.state.currentSession)
            {
                context.state.currentSession.currentRoom.name = payload;
                context.state.currentSession.saveToLocalStorage();
            }
        },

        clearSession:(context) => {        
            context.state.currentSession.eraseSessionInfoFromLocalStorage();
            context.state.currentSession = null;
        }



    },
    modules: {
    }
})
