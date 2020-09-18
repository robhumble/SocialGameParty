import store from '@/store/store.js'

export var mainFramework = {

    //Example property
    name: "Social Game Framework",

    //Common Global Framework functions ------------------------------

    /**
    * Scroll to the bottom of a textArea.
    */
    scrollToBottom: function (elementId) {

        var mainChat = document.getElementById(elementId);
        if (mainChat)
            mainChat.scrollTop = mainChat.scrollHeight;
    },

    /**
     * (Shallow Compare) Quick check to see if an object is "roughly" the same. 
     * @param {object} objectA 
     * @param {object} objectB 
     */
    isObjectSimilar: function (objectA, objectB) {

        if (!objectA || !objectB) {
            this.megaLog("Cannot compare null/undefined for similarities.");
            return false;
        }

        for (var key in objectA) {
            if (objectA[key] != objectB[key])
                return false;
        }

        return true;
    },

    //TODO: This needs to be tested since I moved it.
    /**
     * Quick sleep function to wait in between transactions 
     */
    slowDown: function (sleepInMs) {
        setTimeout(() => { this.megLog(`slowing down for ${sleepInMs}....`), sleepInMs });
    },


    //TODO: build this out substantially - i.e. dump to file, send to logging service, etc.   
    /**
     * Message Logger - only logs to console if forced or if the application is in debug mode.
     * @param {*} msg 
     * @param {*} forcePrint - true will force the console log regardless of if the application is in debug mode.
     */
    megaLog: function (msg, forcePrint) {

        //check to see if the vuex store says we are in debug
        let isDebug = store.getters.isDebugMode;

        if (isDebug || forcePrint)
            console.log(msg);
    }

}