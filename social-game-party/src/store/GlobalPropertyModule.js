/*
Vuex Module
*/

export const GlobalPropertyModule = {
    //namespaced: true,
    state: () => ({
        //Should be in sync with remote OR null

        //Room collection ---------------        
        userList: [],
        hostId: null,
        selectedGameName: null,
        spectatorGameData: null,

        //ActivePlayerGameData collection---------------------
        playerGameData: null,
        currentStep: null,
        currentInstructions: null,
        currentCheckInstructions: null,
        currentTargetedInstructions: null,

        //HostGameData collection---------------------
        results: null,     
        dynamicHostGameData: null, 

        //Local only data ------------------
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

        selectedGameName: state => {
            return state.selectedGameName;
        },

        spectatorGameData: state => {
            return state.spectatorGameData;
        },

        playerGameData: state => {
            return state.playerGameData;
        },

        currentStep: state => {
            return state.currentStep;
        },

        currentInstructions: state => {
            return state.currentInstructions;
        },

        currentCheckInstructions: state => {
            return state.currentCheckInstructions;
        },

        currentTargetedInstructions: state => {
            return state.currentTargetedInstructions;
        },


     
        results: state => {
            return state.results;
        },     

        dynamicHostGameData: state => {
            return state.dynamicHostGameData;
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
                //Room
                userList: state.userList,
                hostId: state.hostId,
                selectedGameName: state.selectedGameName,
                spectatorGameData: state.spectatorGameData,
                
                //AGPD
                playerGameData: state.playerGameData,
                currentInstructions: state.currentInstructions,
                currentCheckInstructions: state.currentCheckInstructions,
                currentTargetedInstructions: state.currentTargetedInstructions,
                currentStep: state.currentStep,

                //Host
                results: state.results,
                dynamicHostGameData: state.dynamicHostGameData,
            }

            return group;
        },

        isCurrentUserInGame: (state, getters) =>{
            
            let uid = getters.currentUserId;
            let userInfo = state.userList.filter(x => x.id == uid)[0];

            if(userInfo)
                return userInfo.isPlaying;

            return false;
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

        setSelectedGameName:(state, payload) => {
            state.selectedGameName = payload
        },

        setSpectatorGameData: (state, payload) => {
            state.spectatorGameData = payload;
        },

        setPlayerGameData: (state, payload) => {
            state.playerGameData = payload;
        },        

        setCurrentStep: (state, payload) => {
            state.currentStep = payload;
        },        


        setCurrentInstructions: (state, payload) => {
            state.currentInstructions = payload;
        },        

        setCurrentCheckInstructions: (state, payload) => {
            state.currentCheckInstructions = payload;
        },        

        setCurrentTargetedInstructions: (state, payload) =>{
            state.currentTargetedInstructions = payload;
        },

      
        setResults: (state, payload) => {
            state.results = payload;
        },        
        
        setDynamicHostGameData: (state, payload) => {
            state.dynamicHostGameData = payload;
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
