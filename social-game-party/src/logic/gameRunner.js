import GameplayDataConnector from "@/dataConnectors/GameplayDataConnector.js";

export default class GameRunner {

    constructor() { }

    currentGame = null;
    dataConnector = null;

    hostId = null;
    currentUserId = null;

    currentGameStep = 1;
    roomName = "";

    setupCurrentGame = function (gameObj, roomName, hostId, currentUserId) {
        this.currentGame = gameObj;
        this.dataConnector = new GameplayDataConnector();
        this.roomName = roomName;
        this.hostId = hostId;
        this.currentUserId = currentUserId;


        if (this.isHost)
            this.initializeRemotePlayerGameData();
    }

    //Run the specified step in the current game
    runStep = function (stepNumber, remoteDataGroup) {

        this.currentGameStep = stepNumber;
        let stepData = this.getGameStep(stepNumber);

        //PreStep
        if (stepData.preStepTarget == 'host' && this.isHost())
            stepData.preStepFunction(remoteDataGroup);

        if (stepData.preStepTarget == 'all')
            stepData.preStepFunction(remoteDataGroup);

        //Main Step
        if (stepData.target == 'host' && this.isHost())
            stepData.stepFunction(remoteDataGroup);

        if (stepData.target == 'all')
            stepData.stepFunction(remoteDataGroup);

        //Check Steps (could do a check immedieately OR call a function to setup check instructions)
        if (stepData.checkTarget == 'host' && this.isHost())
            stepData.checkFunction(remoteDataGroup);

        if (stepData.checkTarget == 'all')
            stepData.checkFunction(remoteDataGroup);

        console.log(remoteDataGroup);
    }

    //Call the specified function in the current game object.
    callGameFunction = function (functionName, remoteDataGroup, functionParms) {
        this.currentGame[functionName](remoteDataGroup, this.currentUserId, functionParms);
    }

    //Private helpers
    initializeRemotePlayerGameData = function () {

        let initialGameData = {
            currentStep: 1,
            //isCurrentStepComplete: false
        }

        this.dataConnector.setPlayerGameData(this.roomName, initialGameData);
    }

    getGameStep = function (sn) {
        let stepData = this.currentGame.gameSteps.filter(x => x.stepNum == sn)[0];
        return stepData;
    }

    isHost = function () {
        return (this.hostId === this.currentUserId);
    }






    //TODO: set the current Host
    setHost(userId) {
        console.log("attempting to set host - " + userId);
        throw Error('Not Yet Implemented!');
    }












}