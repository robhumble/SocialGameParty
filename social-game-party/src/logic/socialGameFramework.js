export var mainFramework = {

    //Example property
    name: "Social Game Framework",

    //Example function
    addStuff: function (x, y) {
        return x + y;
    },

    //Begin Framework functions ------------------------------


    /**
    * Scroll to the bottom of a textArea.
    */
    scrollToBottom: function (elementId) {
        
        var mainChat = document.getElementById(elementId);
        if(mainChat)
            mainChat.scrollTop = mainChat.scrollHeight;
    },


    /**
     * (Shallow Compare) Quick check to see if an object is "roughly" the same. 
     * @param {object} objectA 
     * @param {object} objectB 
     */
    isObjectSimilar: function(objectA, objectB){

        if(!objectA || !objectB ){
            console.log("Cannot compare null/undefined for similarities.");
            return false;
        }        

        for( var key in objectA){
            if(objectA[key] != objectB[key])
                return false;
        }

        return true;
    }

}