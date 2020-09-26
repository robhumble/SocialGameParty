import GameplayDataConnector from "@/dataConnectors/GameplayDataConnector.js";
import RoomDataConnector from "@/dataConnectors/RoomDataConnector.js";
import * as sgf from "@/logic/socialGameFramework.js";

export default class GameRunner {

    constructor() {
        this.gamePlayDataConnector = new GameplayDataConnector();

        this.roomDataConnector = new RoomDataConnector();
    }

    currentGame = null;
    gamePlayDataConnector = null;

    hostId = null;
    currentUserId = null;

    currentGameStep = 1;
    roomName = "";


    roomDataConnector = null;



    /**
     * Starts the game cycle by setting the host for the game.
     * @param {number} hostId 
     * @param {string} roomName 
     */
    setHost(hostId, roomName) {

        this.roomDataConnector.updateHost(hostId, roomName);

    }

    /**
     * Sets up the current game - this is triggered by a watcher on the hostId in the MainGameplayArea component
     * @param {object} gameObj 
     * @param {string} roomName 
     * @param {number} hostId 
     * @param {number} currentUserId 
     */
    setupCurrentGame = function (gameObj, roomName, hostId, currentUserId) {
        this.currentGame = gameObj;
        this.roomName = roomName;
        this.hostId = hostId;
        this.currentUserId = currentUserId;


        if (this.isHost())
            this.initializeRemotePlayerGameData();
    }

    /**
     * Run the specified step in the current game.
     * @param {number} stepNumber 
     * @param {object} remoteDataGroup - data we listen to and keep in the GlobalPropertyModule vuex store.
     */
    runStep = function (stepNumber, remoteDataGroup) {

        //For the time being - the only one that should actually be "Running a step" should be the host
        if (this.isHost()) {

            this.currentGameStep = stepNumber;
            let stepData = this.getGameStep(stepNumber);

            //Start a write batch
            var stepBatch = this.gamePlayDataConnector.getWriteBatch();

            //May want to clean out instructions from the previous step first...
            if (stepData.cleanInstructionsFirst)
                stepBatch = this.cleanInstructions(stepBatch);

            //PreStep
            if (stepData.preStepTarget == 'host' && this.isHost())
                stepBatch = stepData.preStepFunction(remoteDataGroup, stepBatch);

            if (stepData.preStepTarget == 'all')
                stepBatch = stepData.preStepFunction(remoteDataGroup, stepBatch);

            //Main Step
            if (stepData.target == 'host' && this.isHost())
                stepBatch = stepData.stepFunction(remoteDataGroup, stepBatch);

            if (stepData.target == 'all')
                stepBatch = stepData.stepFunction(remoteDataGroup);

            //Check Steps (could do a check immedieately OR call a function to setup check instructions)
            if (stepData.checkTarget == 'host' && this.isHost())
                stepBatch = stepData.checkFunction(remoteDataGroup, stepBatch);

            if (stepData.checkTarget == 'all')
                stepBatch = stepData.checkFunction(remoteDataGroup, stepBatch);

            this.gamePlayDataConnector.commitWriteBatch(stepBatch);

            sgf.mainFramework.megaLog(remoteDataGroup);
        }
    }

    /**
     * Call the specified function in the current game object.
     * @param {string} functionName - name of function located in the current game object.
     * @param {object} remoteDataGroup 
     * @param {object} functionParms - object containing additional params needed for the function
     */
    callGameFunction = function (functionName, remoteDataGroup, functionParms) {
        this.currentGame[functionName](remoteDataGroup, this.currentUserId, functionParms);
    }

    //Private helpers -------------------------------------------

    /**
     * Initialize the game by setting the current step to "1" in the database.
     */
    initializeRemotePlayerGameData = function () {

        let initialGameData = {
            currentStep: 1,
        }

        this.gamePlayDataConnector.setPlayerGameData(this.roomName, initialGameData);
    }

    /**
     * Reset Game Data (i.e. clear game data in the database, null out the game object, return all other properties to start positions)
     */
    resetGame = function () {

        //If this is the host, wipe remote game data.
        if (this.isHost() && this.roomName)
            this.gamePlayDataConnector.resetGameData(this.roomName);

        //Game Runner vars
        this.currentGame = null;
        //this.gamePlayDataConnector = null;

        this.hostId = null;
        this.currentUserId = null;

        this.currentGameStep = 1;
        this.roomName = "";

    }

    /**
     * Get the step data from the current game based on the step number.
     * @param {number} sn - the step number we are looking for. 
     */
    getGameStep = function (sn) {
        let stepData = this.currentGame.gameSteps.filter(x => x.stepNum == sn)[0];
        return stepData;
    }

    isHost = function () {
        return (this.hostId === this.currentUserId);
    }

    isGameInProgress = function () {

        if (this.currentGame)
            return true;

        return false;
    }


    /**
     * Clean out the instruction properties in the Room Map
     * @param {object} batch 
     */
    cleanInstructions = function (batch) {

        //Add to writeBatch
        let dataToUpdate = {
            currentCheckInstructions: null,
            currentInstructions: null
        };
        return this.gamePlayDataConnector.addToBatchUpdate(batch, "rooms", this.roomName, dataToUpdate);
    }






}