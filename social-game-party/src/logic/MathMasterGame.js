import GameplayDataConnector from "@/dataConnectors/GameplayDataConnector.js";

export default class MathMasterGame {

    name = "MathMaster";

    dataConnector = null;
    roomName = null;

    #configOptions = {
        totalMathProblems: 3,
        problemLo: 0,
        problemHi: 20
    }

    constructor(roomName) {
        this.dataConnector = new GameplayDataConnector();

        this.roomName = roomName;
    }

    //TODO: At some point it would nice to have this as data that lives in the db.
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

    //Display a loading screen.
    setupLoadingScreen = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) console.log('no remoteDataGroup in setupLoadingScreen')

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


    buildProblemsStep = function (remoteDataGroup, batch) {

        let problemsToBuild = this.#configOptions.totalMathProblems;

        let mathProblems = [];

        for (let x = 0; x < problemsToBuild; x++) {
            let prob = this.buildMathProblem();
            mathProblems.push(prob);
        }

        if (remoteDataGroup)
            console.log('buildProblemsStep')

        //Add to the writeBatch
        let dataToUpdate = {
            playerGameData: {
                mathProblems: mathProblems,
                currentStep: 2
            }
        };
        return this.dataConnector.gameplayAddToBatch(batch, "update", this.roomName, dataToUpdate);

    }

    //Set up loop instructions for answering the questions.
    setupQuestionAndAnswerLoopThrough = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) console.log('no remoteDataGroup in setupQuestionAndAnswerLoopThrough')

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


    //Prepare remote data for the check function
    prepareCheckInstructions = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) console.log('no remoteDataGroup in prepareCheckInstructions')

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


    pickAWinnerAndDisplayResults = function (remoteDataGroup, batch) {

        let gd = remoteDataGroup.playerGameData;

        let winner = gd.results.reduce((acc, x) => {
            return (x.answerResults > acc.answerResults) ? x : acc;
        });


        //Display Results instructions    
        let getUserInfo = (targetUserId) => remoteDataGroup.userList.filter(x => x.id == targetUserId)[0];

        let userInfo = getUserInfo(winner.userId);

        let totals = "SCORES: \n";
        remoteDataGroup.playerGameData.results.forEach(x => totals += `${getUserInfo(x.userId).name} : ${x.answerResults}`);

        let instructions = {
            type: "Display",
            comp: "ResultScreen",
            title: `${userInfo.name} was the winner with a total of ${winner.answerResults} correct answers!`,
            msg: totals
        }

        //Add to the writeBatch
        let dataToUpdate = {
            playerGameData: {
                winner: winner,
            },
            currentInstructions: instructions
        };
        return this.dataConnector.gameplayAddToBatch(batch, "update", this.roomName, dataToUpdate);

    }






    //Functions called from from Vue component (These generally run in thier own transaction - NOT BATCH )--------------------------------------------------------------------------

    //Call this after a user has completed all questions
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

    //Check function - Go to the next step if all players are done submitting answers
    checkToSeeIfAllPlayersAreDone = function (remoteDataGroup, userId) {

        if (userId == remoteDataGroup.hostId) {

            let res = remoteDataGroup.playerGameData.results;

            if (res && res.length == remoteDataGroup.userList.length)
            {
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

    getRandomInt = function (lo, hi) {
        let min = Math.floor(lo);
        let max = Math.floor(hi);

        let rand = (Math.random() * (max - min + 1)) + min;
        return Math.floor(rand);
    }

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


