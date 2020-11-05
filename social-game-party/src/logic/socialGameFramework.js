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

    //TODO: Consider making recursive to check nested arrays....might get unweildly though.
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

        //Check each property in an object a against object b
        let keyCheck = (oA, oB) => {
            for (var key in oA) {
                if (oA[key] != oB[key])
                    return false;
            }
            return true;
        }

        try {
            //Check each element if it's an array, just properties other wise
            if (Array.isArray(objectA)) {
                for (let i = 0; i < objectA.length; i++) {
                    return keyCheck(objectA[i], objectB[i]);
                }
            }
            else
                return keyCheck(objectA, objectB);
        } catch (err) {
            console.log(err.message);
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
    },


    /**
     * Get a random integer between lo and hi (inclusive.)
     * @param {number} lo 
     * @param {number} hi 
     */
    getRandomInt: function (lo, hi) {
        let min = Math.floor(lo);
        let max = Math.floor(hi);

        let rand = (Math.random() * (max - min + 1)) + min;
        return Math.floor(rand);
    },

    /**
     * Get a random true or false.
     */
    randomTrueFalse() {

        //Get a random number between 1 and 50, return true if even.
        let rand = this.getRandomInt(0, 50);

        if (rand % 2 == 0)
            return true;

        return false;

    },



    //GAME SPECIFIC LOGIC---------------------------------------------------------------------------------------

    gameTools: {

        //Pseudo- Enums

        instructionTypes: {
            Display: "Display",  //Display this to all players
            LoopThrough: "LoopThrough",  //Run the specified loop for all players
        },

        gameComponents: {
            LoadingScreen: "LoadingScreen",
            QuestionAndAnswer: "QuestionAndAnswer",
            ResultScreen: "ResultScreen",
        },

        //Used to indicate "where" a src object for a check function is stored
        rootObjects: {
            player: "player",  // ActivePlayerGameData -> playerGameData AKA  ActivePlayerGameData -> dynamicPlayerGameData
            host: "host",   // HostGameData -> dynamicHostGameData
            results: "results"  // HostGameData -> results

        },



        //Instruction Builders

        //Examples from math master
        /*

          let instructions = {
            type: "Display",        //Display this to all p
            comp: "LoadingScreen",
            msg: "Preparing Game..."
        }
          */

        /*
           let instructions = {
             type: "Display",
             comp: "ResultScreen",
             title: winnerString,
             msg: totals
         }
         */

        buildSimpleDisplayInstructions: function (c, t, m) {

            let instructions = {
                type: this.instructionTypes.Display,
                comp: c,
                title: t,
                msg: m
            }

            return instructions;
        },


        /*
        let instructions = {
          type: "LoopThrough",
          comp: "QuestionAndAnswer",

          loopSrc: "mathProblems",

          questionVar: "presentationProblem",  //questionText
          answerVar: "answer",

          resultFunction: "updatePlayerResults"
      }
      */

        buildLoopThroughInstructions: function (c, src, qVar, aVar, resFunc) {
            let instructions = {
                type: this.instructionTypes.LoopThrough,
                comp: c,

                loopSrc: src,

                questionVar: qVar,  //questionText
                answerVar: aVar,

                resultFunction: resFunc
            }

            return instructions;
        },


        /*
               let currentCheckInstructions = {
                  rootObj: "results", //player, host, or results
                  watchTarget: "results",  // watchTarget is only checked if we aren't looking at the results rootObj, so going forward this line is redundant
                  checkFunction: "checkToSeeIfAllPlayersAreDone"
              }   
        */

        //TODO: Root should use the enum - ADD A CHECK
        buildCheckInstructions: function (root, watch, checkFunc) {
            let currentCheckInstructions = {
                rootObj: root, //player, host, or results
                watchTarget: watch,  // watchTarget is only checked if we aren't looking at the results rootObj, so going forward this line is redundant
                checkFunction: checkFunc
            }

            return currentCheckInstructions;
        },


        buildQuestionAndAnswerInstructions: function( qText, followFunc){
            let instructions = {
                type: this.instructionTypes.Display,
                comp: 'QuestionAndAnswer',
                questionText: qText,
                followUpFunction: followFunc
            }            

            return instructions;
        }



    }

}