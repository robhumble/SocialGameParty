//import GameplayDataConnector from "@/dataConnectors/GameplayDataConnector.js";
import * as sgf from "@/logic/socialGameFramework.js";

import ActivePlayerGameDataConnector from "@/dataConnectors/ActivePlayerGameDataConnector.js";
import HostGameDataConnector from "@/dataConnectors/HostGameDataConnector.js";


export default class BaseGame {

    name = "";
    roomName = null;
    activePlayerGameDataConnector = null;
    hostGameDataConnector = null;

    configOptions = {
    }

    constructor(roomName) {


        this.activePlayerGameDataConnector = new ActivePlayerGameDataConnector();
        this.hostGameDataConnector = new HostGameDataConnector();

        this.roomName = roomName;
    }

    //TODO: At some point it would nice to have this as data that lives in the db.

    /**
     * Game Steps define each "step" in a given game.  Each step describes a phase of the game and gives instructions to the host or other players describing what they should be doing. 
     */
    gameSteps = [

        //Example Step
        /*
        {
           stepNum: 1,
            desc: "Build out problems",
            cleanInstructionsFirst: false, 

            preStepTarget: 'host',
            preStepFunction: (data, batch) => { return this.setupLoadingScreen(data, batch) },

            target: 'host',
            stepFunction: (data, batch) => { return this.buildProblemsStep(data, batch)  },

            followUpTarget: 'none',
            followUpFunction:  (data, batch) => { return this.followUp(data, batch)  },

            checkTarget: 'host',
            checkFunction: (data, batch) => { return this.prepareCheckInstructions(data, batch)  }


        },
        */

    ];


    //Main step functions - (These generally are batched writes)-------------------------------------------------------
    /*
     * Each of these functions below are supposed to be run exclusively by the host.  Each expects the following params
     * 
     * function (remoteDataGroup, batch)
     * 
     * remoteDataGroup - data we listen to and keep in the GlobalPropertyModule vuex store.
     * batch - a write batch, generally there is one per step that is passed in and out of each main step function until the step is completed... at which point we commit the write batch.
     */




    /**
     * Setup the loading screen at the beginning of the game.
     * @param {object} remoteDataGroup 
     * @param {object} batch 
     */
    setupLoadingScreen = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) sgf.mainFramework.megaLog('no remoteDataGroup in setupLoadingScreen')

        let instructions = {
            type: "Display",
            comp: "LoadingScreen",
            msg: "Preparing Game..."
        }

        //Add to the writeBatch
        let dataToUpdate = {
            currentInstructions: instructions
        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }







    //Functions called from from Vue component (These generally run in their own transaction - NOT BATCH )--------------------------------------------------------------------------
    /*
     * Each of the functions below is designed to be called by callGameFunction() in the game runner.  These functions expect the following params.
     *
     * function (remoteDataGroup, userId, answerResults) 
     * 
     * remoteDataGroup - data we listen to and keep in the GlobalPropertyModule vuex store.
     * userId - the userId of the user calling the function
     * (OPTIONAL)functionParams - an additional object that contains function params, can be named anything, can be an object with multiple params nested inside.
     */




    //General "Private" Helper functions -----------------------------------------------------------------


    getActivePlayerCount = function (remoteDataGroup) {

        let playerCount = 0;
        remoteDataGroup.userList.forEach(user => {
            if (user.isPlaying)
                playerCount++;
        })

        return playerCount;
    }




}


