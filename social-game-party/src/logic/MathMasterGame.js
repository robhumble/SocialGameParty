import GameplayDataConnector from "@/dataConnectors/GameplayDataConnector.js";
import * as sgf from "@/logic/socialGameFramework.js";

export default class MathMasterGame {

    name = "MathMaster";

    dataConnector = null;
    roomName = null;

    #configOptions = {
        totalMathProblems: 10,
        // If the game is allowed to roll 0, the game will have bugs
        problemLo: 1,
        problemHi: 25
    }

    constructor(roomName) {
        this.dataConnector = new GameplayDataConnector();

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
            preStepFunction: (d) => { return this.setupLoadingScreen(d) },

            target: 'host',
            stepFunction: (d) => { return this.buildProblemsStep(d) },

            followUpTarget: 'none',
            followUpFunction:  (d) => { return this.followUp(d) },

            checkTarget: 'host',
            checkFunction: (d) => { return this.prepareCheckInstructions(d) }

        },
        */
        {
            stepNum: 1,
            desc: "Build out problems",
            cleanInstructionsFirst: false,

            preStepTarget: 'host',
            preStepFunction: (data, batch) => { return this.setupLoadingScreen(data, batch) },

            target: 'host',
            stepFunction: (data, batch) => { return this.buildProblemsStep(data, batch) },
        },
        {
            stepNum: 2,
            desc: "Players answer problems.",
            cleanInstructionsFirst: true,

            preStepTarget: 'host',
            preStepFunction: (data, batch) => { return this.setupQuestionAndAnswerLoopThrough(data, batch) },

            checkTarget: 'host',
            checkFunction: (data, batch) => { return this.prepareCheckInstructions(data, batch) }
        },
        {
            stepNum: 3,
            desc: "Determine winner and display the results",
            cleanInstructionsFirst: true,

            target: 'host',
            stepFunction: (data, batch) => { return this.pickAWinnerAndDisplayResults(data, batch) },

        },


    ];


    //Main step functions - (These generally are batched writes)-------------------------------------------------------
    /*
     * Each of these functions below are supposed to be run exclusively by the host.  Each expects the following params
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
        return this.dataConnector.gameplayAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }

    /**
     * Build a number of math problems for each player to solve. (Should be used by the Host)
     * @param {object} remoteDataGroup 
     * @param {object} batch 
     */
    buildProblemsStep = function (remoteDataGroup, batch) {

        let problemsToBuild = this.#configOptions.totalMathProblems;

        let mathProblems = [];

        for (let x = 0; x < problemsToBuild; x++) {
            let prob = this.buildMathProblem();
            mathProblems.push(prob);
        }

        if (remoteDataGroup)
            sgf.mainFramework.megaLog('buildProblemsStep')

        //Add to the writeBatch
        let dataToUpdate = {
            playerGameData: {
                mathProblems: mathProblems,
                currentStep: 2
            }
        };
        return this.dataConnector.gameplayAddToBatch(batch, "update", this.roomName, dataToUpdate);

    }

    /**
     * Set up loop instructions for answering the questions.  (Should be used by the Host)
     * @param {object} remoteDataGroup 
     * @param {object} batch 
     */
    setupQuestionAndAnswerLoopThrough = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) sgf.mainFramework.megaLog('no remoteDataGroup in setupQuestionAndAnswerLoopThrough')

        let instructions = {
            type: "LoopThrough",
            comp: "QuestionAndAnswer",

            loopSrc: "mathProblems",

            questionVar: "presentationProblem",  //questionText
            answerVar: "answer",

            resultFunction: "updatePlayerResults"
        }

        //Add to the writeBatch
        let dataToUpdate = {
            currentInstructions: instructions
        };
        return this.dataConnector.gameplayAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }

    /**
    * Prepare remote data for the check function.  (Should be used by the Host)
    * @param {object} remoteDataGroup 
    * @param {object} batch 
    */
    prepareCheckInstructions = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) sgf.mainFramework.megaLog('no remoteDataGroup in prepareCheckInstructions')

        let currentCheckInstructions = {
            watchTarget: "results",
            checkFunction: "checkToSeeIfAllPlayersAreDone"
        }

        //Add to the writeBatch
        let dataToUpdate = {
            currentCheckInstructions: currentCheckInstructions
        };
        return this.dataConnector.gameplayAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }


    /**
     * Look through the results to determine the winning player, create display instructions to show the winner.  (Should be used by the Host)
     * @param {object} remoteDataGroup 
     * @param {object} batch 
     */
    pickAWinnerAndDisplayResults = function (remoteDataGroup, batch) {

        let gd = remoteDataGroup.playerGameData;

        let sorted = gd.results.sort((acc, x) => {
            return (x.answerResults > acc.answerResults) ? x : acc;
        });

        // Add every player that has the winning score to an array.
        let winners = [];
        for (const player of sorted) {
            if (sorted[0].answerResults == player.answerResults) { winners.push(player); }
        }

        //Display Results instructions    
        let getUserInfo = (targetUserId) => remoteDataGroup.userList.filter(x => x.id == targetUserId)[0];

        //Build an array containing each winners user data.
        let userInfo = [];
        for (const player of winners) {
            userInfo.push(getUserInfo(player.userId));
        }

        //Get everyones score in a string.
        let totals = "SCORES: \n";
        remoteDataGroup.playerGameData.results.forEach(x => totals += `${getUserInfo(x.userId).name} : ${x.answerResults} \n`);

        //Get the winner string.
        let winnerString = `Top Score: ${sorted[0].answerResults} \n Winners: `;
        let index = 0;
        for (const info of userInfo) {
            winnerString = winnerString + info.name;
            if (index < userInfo.length - 1) { winnerString += ", "; }
            index++;
        }

        let instructions = {
            type: "Display",
            comp: "ResultScreen",
            title: winnerString,
            msg: totals
        }

        //Add to the writeBatch
        let dataToUpdate = {
            playerGameData: {
                winner: winners,
            },
            currentInstructions: instructions
        };
        return this.dataConnector.gameplayAddToBatch(batch, "update", this.roomName, dataToUpdate);

    }



    //Functions called from from Vue component (These generally run in thier own transaction - NOT BATCH )--------------------------------------------------------------------------
    /*
     * Each of the functions below is designed to be called by callGameFunction() in the game runner.  These functions expect the following params.
     *
     * remoteDataGroup - data we listen to and keep in the GlobalPropertyModule vuex store.
     * userId - the userId of the user calling the function
     * (OPTIONAL)functionParams - an additional object that contains function params, can be named anything, can be an object with multiple params nested inside.
     */


    /**
     * Call this after a user has completed all questions, this will submit an result object for the user to the database.
     * @param {object} remoteDataGroup 
     * @param {number} userId 
     * @param {object} answerResults - ....contains the number of correctly answered questions by the specified user.
     */
    updatePlayerResults = function (remoteDataGroup, userId, answerResults) {

        remoteDataGroup

        let resultObj = {
            userId: userId,
            answerResults: answerResults
        }

        let gd = remoteDataGroup.playerGameData;

        if (!gd.results)
            gd.results = [];

        gd.results.push(resultObj);

        this.dataConnector.updatePlayerGameData(this.roomName, "results", gd.results);
    }

    /**
     * Check function - Go to the next step if all players are done submitting answers. (Should be used by the Host)
     * @param {object} remoteDataGroup 
     * @param {number} userId 
     */
    checkToSeeIfAllPlayersAreDone = function (remoteDataGroup, userId) {

        if (userId == remoteDataGroup.hostId) {

            let res = remoteDataGroup.playerGameData.results;

            if (res && res.length == remoteDataGroup.userList.length) {
                //Move to step 3 (and clear all existing instructions.)
                this.dataConnector.updateWholeRoomViaFunction(this.roomName, (roomData) => {
                    roomData.playerGameData.currentStep = 3;
                    roomData.currentCheckInstructions = null;
                    roomData.currentInstructions = null;
                    return roomData;
                });
            }
        }

    }

    //Go to the desired step
    // moveToStepNonBatch = function (stepNumber) {
    //     this.dataConnector.updateWholeRoomViaFunction(this.roomName, (roomData) => {
    //         roomData.playerGameData.currentStep = stepNumber;
    //         return roomData;
    //     });
    // }



    //General "Private" Helper functions -----------------------------------------------------------------

    /**
     * Build a math problem to be answered by the players.
     */
    buildMathProblem = function () {

        let problemLo = this.#configOptions.problemLo,
            problemHi = this.#configOptions.problemHi

        let x = this.getRandomInt(problemLo, problemHi);
        let y = this.getRandomInt(problemLo, problemHi);

        let op = this.getRandomOperator();

        let prob = `${x} ${op} ${y}`;

        let z = eval(prob);

        let answerVarInt = this.getRandomInt(1, 3);

        let actual = `${x} ${op} ${y} = ${z}`;

        let questionPresentation = '', correctAnswer = 0;

        switch (answerVarInt) {

            //x is missing
            case 1: questionPresentation = `? ${op} ${y} = ${z}`;
                correctAnswer = x;
                break;
            //y is missing
            case 2: questionPresentation = `${x} ${op} ? = ${z}`;
                correctAnswer = y;
                break;
            //z is missing
            case 3: questionPresentation = `${x} ${op} ${y} = ?`;
                correctAnswer = z;
                break;
        }

        let problemObj = {

            x: x,
            y: y,
            z: z,
            fullProblem: actual,
            presentationProblem: questionPresentation,
            answer: correctAnswer
        }

        return problemObj;

    }

    /**
     * Get a random integer between lo and hi (inclusive.)
     * @param {number} lo 
     * @param {number} hi 
     */
    getRandomInt = function (lo, hi) {
        let min = Math.floor(lo);
        let max = Math.floor(hi);

        let rand = (Math.random() * (max - min + 1)) + min;
        return Math.floor(rand);
    }

    //TODO: we are actually excluding "/" for now - need to change how we build these to avoid fractional answers (i.e. when building a "/", multiply instead and then move things around)
    /**
     * Get a random operator.  (includes: +,-,*,/)
     */
    getRandomOperator = function () {

        let op = this.getRandomInt(1, 3);

        switch (op) {
            case 1: return '+';
            case 2: return '-';
            case 3: return '*';
            case 4: return '/';
            default: return '+';
        }
    }




}


