/*
Vuex Module
*/

export const GlobalPropertyModule = {
    //namespaced: true,
    state: () => ({
        userList: []
    }),

    getters: {

        userList: state => {
            return state.userList;
        },

    },
    //Synchronous (Simple setters)
    mutations: {

        setUserList: (state, payload) => {
            state.userList = payload;
        },

    },
    //Async (More complex functions) 
    actions: {

    },

}
