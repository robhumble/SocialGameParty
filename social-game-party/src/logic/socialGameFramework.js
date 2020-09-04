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
            console.log("Cannot compare null/undefined for similarities.");
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
        setTimeout(() => { console.log(`slowing down for ${sleepInMs}....`), sleepInMs });
    }

}