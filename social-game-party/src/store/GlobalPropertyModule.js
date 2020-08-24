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

        currentInstructions: null,
        currentCheckInstructions: null,

        //Local only data 
        myTempGameData: null

    }),

    getters: {

        //Data sync with remote room
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

        currentInstructions: state => {
            return state.currentInstructions;
        },

        currentCheckInstructions: state => {
            return state.currentCheckInstructions;
        },

        //Local only data 
        myTempGameData: state => {
            return state.myTempGameData;
        },

        //Helpers
        isGameStarted: state => {
            return (state.hostId)
        },

        //Collect everything we think we know about the state of remote data right now.
        getRemoteDataGroup: state => {

            let group ={
                userList: state.userList,
                hostId: state.hostId,
                spectatorGameData: state.spectatorGameData,
                playerGameData: state.playerGameData,
                currentInstructions: state.currentInstructions,
                currentCheckInstructions: state.currentCheckInstructions,
            }

            return group;
        }

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

        setCurrentInstructions: (state, payload) => {
            state.currentInstructions = payload;
        },        

        setCurrentCheckInstructions: (state, payload) => {
            state.currentCheckInstructions = payload;
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
