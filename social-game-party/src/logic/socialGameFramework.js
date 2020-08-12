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
    }

}