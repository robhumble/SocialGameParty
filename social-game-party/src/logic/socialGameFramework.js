import store from '@/store/store.js'
import Card from "@/logic/Cards/Card.js";

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

    //TODO: Make this recursive to check for nested objects and Arrays
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

        //hacky quick check - if the object have matching time stamp keys, consider them the same
        if (objectA.timeStampKey && objectB.timeStampKey && objectA.timeStampKey == objectB.timeStampKey)
            return true;

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
    megaLog: function (msg, forcePrint, includeStackTrace) {

        //check to see if the vuex store says we are in debug
        let isDebug = store.getters.isDebugMode;

        //includeStackTrace = 1;
        if (includeStackTrace) {
            let stackTrace = (new Error()).stack;
            msg += '[[' + stackTrace + ']]';
        }

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

        //Enums_________________________________________________________________________________

        gameList: {
            MathMaster: "MathMaster",
            BlackJack: "BlackJack"
        },

        //Pseudo- Enums
        instructionTypes: {
            Display: "Display",  //Display this to all players
            LoopThrough: "LoopThrough",  //Run the specified loop for all players
        },

        gameComponents: {
            LoadingScreen: "LoadingScreen",
            QuestionAndAnswer: "QuestionAndAnswer",
            ResultScreen: "ResultScreen",
            CardTable: "CardTable",
            YesNoQuestion: "YesNoQuestion",
            RowHUD: "RowHUD"
        },

        //Used to indicate "where" a src object for a check function is stored
        rootObjects: {
            player: "player",  // ActivePlayerGameData -> playerGameData AKA  ActivePlayerGameData -> dynamicPlayerGameData
            host: "host",   // HostGameData -> dynamicHostGameData
            results: "results"  // HostGameData -> results

        },


        //TODO: Re-evaluate where this should live.
        //Card related Helpers?_________________________________________________________________________________


        convertCardArrayToMapArray(cardArray) {

            let cardMapArray = [];
            cardArray.forEach(x => cardMapArray.push(x.toMap()));

            return cardMapArray;
        },

        getCardArrayFromMapArray(mapArray) {

            let cardArray = [];

            mapArray.forEach((x) => {
                let c = new Card();
                c.fromMap(x)
                cardArray.push(c);
            });

            return cardArray;
        },


        //This function will be used to build the configuration object that drive what the card table shows to the user and how it behaves.
        //Card table accepts a config object to describe the rules we want to use for black jack  (i.e. where is the deck i should use? where is the hand I should use? expose the hit control,  
        //expose the stay control, name of call back function to use to update the results  PROBABLY writePlayerRoundResults())\


        //gn is the gameName (only black jack atm)
        //THESE WILL ALL BE IN THE RemoteDataGroup OBJECT IN THE VUEX STORE ----------------------
        //dL (deckLocation) - the remote object where the deck map is located
        //dN (deckName) - the name of the deck map in the deck location
        //pIL (playerInfoLocation) - the remote object where the playerInfo array is located (everything about the players - including thier hand - which we assume will be called "cards")
        //pIN (playerInfoName) the name of the array of playerInfo maps in the pIN
        buildCardTableConfig: function (gn, dL, dN, pIL, pIN) {


            //...current card table component data
            /*
            cardDeck: null, //The Deck
            playerHand: [], //The players cards        
            deckViewType: "scroll",
            */


            //The deck and player hands should be 



            let cardTableConfig = {

                gameName: gn,
                showDebugTools: false,

                //THESE WILL ALL BE IN THE RemoteDataGroup OBJECT IN THE VUEX STORE
                //Describe the location and name of the deck and the player hand object in the remote document...
                deckLocation: dL,
                deckName: dN,
                playerInfoLocation: pIL,
                playerInfoName: pIN,

                //Deck 
                showContentsOfDeck: false,

                //Deck Controls


                //Hands
                showCurrentPlayerHand: false,
                showAllPlayerHands: false,

                //Hand Controls                
                //(these controls have a default behavior - providing a function name will call the function instead of using default behavior overriding the control)
                showHitControl: false,
                hitControlFunctionName: null,
                hitControlFunc: null,

                showStandControl: false,
                standControlFunctionName: null,
                standControlFunc: null,

                endTurnFunctionName: null
            }


            return cardTableConfig;
        },




        //Instruction Builders_________________________________________________________________________________

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

        buildSimpleDisplayInstructions: function (c, t, m, targetUserId = null) {

            let instructions = {
                type: this.instructionTypes.Display,
                comp: c,
                title: t,
                msg: m
            }

            if (targetUserId)
                instructions.targetUserId = targetUserId;

            instructions.timeStampKey = Date.now();

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

        buildLoopThroughInstructions: function (c, src, qVar, aVar, resFunc, targetUserId = null) {
            let instructions = {
                type: this.instructionTypes.LoopThrough,
                comp: c,

                loopSrc: src,

                questionVar: qVar,  //questionText
                answerVar: aVar,

                resultFunction: resFunc
            }

            if (targetUserId)
                instructions.targetUserId = targetUserId;

            instructions.timeStampKey = Date.now();

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

            currentCheckInstructions.timeStampKey = Date.now();
            return currentCheckInstructions;
        },


        //c should be the Q uestionAndAnswer component or the YesNoQuestion component
        buildQuestionAndAnswerInstructions: function (c, qText, followFunc, targetUserId = null) {
            let instructions = {
                type: this.instructionTypes.Display,
                comp: c,
                questionText: qText,
                followUpFunction: followFunc
            }

            if (targetUserId)
                instructions.targetUserId = targetUserId;

            instructions.timeStampKey = Date.now();
            return instructions;
        },


        buildCardTableInstructions: function (cardTableConfig, targetUserId = null) {

            let instructions = {
                type: this.instructionTypes.Display,
                comp: this.gameComponents.CardTable,
                config: cardTableConfig
            }

            if (targetUserId)
                instructions.targetUserId = targetUserId;

            instructions.timeStampKey = Date.now();
            return instructions;
        },


        buildHudInstructions: function (hudInfoData, hudInfoFuncName) {

            let instructions = {
                type: this.instructionTypes.Display,
                comp: this.gameComponents.RowHUD,
                hudInfoData: hudInfoData,
                hudInfoFuncName: hudInfoFuncName
            }

            //Don't know if this is needed?
            // if (targetUserId)
            // instructions.targetUserId = targetUserId;

            instructions.timeStampKey = Date.now();

            return instructions;
        }




    }

}