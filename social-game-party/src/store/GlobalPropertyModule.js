/*
Vuex Module
*/

export const GlobalPropertyModule = {
    //namespaced: true,
    state: () => ({
        
        //Should be in sync with remote OR null
        userList: [],
        hostId: null,
        spectatorGameData: null,
        playerGameData: null,

        //Local only data 
        myTempGameData: null

    }),

    getters: {

        userList: state => {
            return state.userList;
        },

        hostId: state => {
            return state.hostId;
        },

        spectatorGameData: state => {
            return state.spectatorGameData;
        },

        playerGameData: state => {
            return state.playerGameData;
        },


        //Local only data 

        myTempGameData: state => {
            return state.myTempGameData;
        },



    },
    //Synchronous (Simple setters)
    mutations: {

        setUserList: (state, payload) => {
            state.userList = payload;
        },

        setHostId: (state, payload) => {
            state.hostId = payload;
        },

        setSpectatorGameData: (state, payload) => {
            state.spectatorGameData = payload;
        },

        setPlayerGameData: (state, payload) => {
            state.playerGameData = payload;
        },        

        //Local only data 
        setMyTempGameData: (state, payload) => {
            state.myTempGameData = payload;
        },

    },
    //Async (More complex functions) 
    actions: {

    },

}
