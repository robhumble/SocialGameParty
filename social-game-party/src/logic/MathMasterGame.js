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

            preStepTarget: 'host',
            preStepFunction: (d) => { return this.setupLoadingScreen(d) },

            target: 'host',
            stepFunction: (d) => { return this.buildProblemsStep(d) },
        },
        {
            stepNum: 2,
            desc: "Players answer problems.",

            preStepTarget: 'host',
            preStepFunction: (d) => { return this.setupQuestionAndAnswerLoopThrough(d) },

            checkTarget: 'host',
            checkFunction: (d) => { return this.prepareCheckInstructions(d) }
        },
        {
            stepNum: 3,
            desc: "Determine winner.",

            target: 'host',
            stepFunction: (d) => { return this.pickAWinner(d) },

        },
        {
            stepNum: 4,
            desc: "Display winner.",

            target: 'host',
            stepFunction: (d) => { return this.displayResults(d) },
        },


    ];


    //Display a loading screen.
    setupLoadingScreen = function (remoteDataGroup) {

        if (!remoteDataGroup) console.log('no remoteDataGroup in setupLoadingScreen')

        let instructions = {
            type: "Display",
            comp: "LoadingScreen",
            msg: "Preparing Game..."
        }

        //this.dataConnector.updatePlayerGameData(this.roomName, "currentInstructions", instructions);
        
        this.dataConnector.setCurrentInstructions(this.roomName, instructions);
    }


    //Build the math problems that we will use during the game.
    buildProblemsStep = function (remoteDataGroup) {

        let problemsToBuild = this.#configOptions.totalMathProblems;

        let mathProblems = [];

        for (let x = 0; x < problemsToBuild; x++) {
            let prob = this.buildMathProblem();
            mathProblems.push(prob);
        }

        if (remoteDataGroup)
            console.log('buildProblemsStep')

        this.dataConnector.updatePlayerGameData(this.roomName, "mathProblems", mathProblems);
        this.moveToStep(2);
    }

    //Set up loop instructions for answering the questions.
    setupQuestionAndAnswerLoopThrough = function (remoteDataGroup) {

        if (!remoteDataGroup) console.log('no remoteDataGroup in setupQuestionAndAnswerLoopThrough')

        let instructions = {
            type: "LoopThrough",
            comp: "QuestionAndAnswer",

            loopSrc: "mathProblems",

            questionVar: "presentationProblem",  //questionText
            answerVar: "answer",

            resultFunction: "updatePlayerResults"
        }

        //this.dataConnector.updatePlayerGameData(this.roomName, "currentInstructions", instructions);
        this.dataConnector.setCurrentInstructions(this.roomName, instructions);
    }


    //Prepare remote data for the check function
    prepareCheckInstructions = function (remoteDataGroup) {

        if (!remoteDataGroup) console.log('no remoteDataGroup in prepareCheckInstructions')

        let currentCheckInstructions = {
            watchTarget: "results",
            checkFunction: "checkToSeeIfAllPlayersAreDone"
        }

        //this.dataConnector.updatePlayerGameData(this.roomName, "currentCheckInstructions", currentCheckInstructions);
        this.dataConnector.setCurrentCheckInstructions(this.roomName, currentCheckInstructions);
    }


    pickAWinner = function (remoteDataGroup) {

        let gd = remoteDataGroup.playerGameData;

        let winner = gd.results.reduce((acc, x) => {
            return (x.answerResults > acc.answerResults) ? x : acc;
        });

        this.dataConnector.updatePlayerGameData(this.roomName, "winner", winner);
        this.moveToStep(4);
    }

    displayResults = function (remoteDataGroup) {

        if (!remoteDataGroup) console.log('no remoteDataGroup in displayResults')

/*
        this.dataConnector.updatePlayerGameDataViaFunction(this.roomName, (playerGameData) => {

            let winner = playerGameData.winner;

            let getUserInfo = (targetUserId) => remoteDataGroup.userList.filter(x => x.id == targetUserId)[0];

            let userInfo = getUserInfo(winner.userId);

            let totals = "SCORES: \n";
            playerGameData.results.forEach(x => totals += `${getUserInfo(x.userId).name} : ${x.answerResults}`);

            let instructions = {
                type: "Display",
                comp: "ResultScreen",
                title: `${userInfo.name} was the winner with a total of ${winner.answerResults} correct answers!`,
                msg: totals
            }

            playerGameData.currentInstructions = instructions;

            return playerGameData;
        });
        */

        this.dataConnector.updateWholeRoomViaFunction(this.roomName, (roomData) => {

            let winner = roomData.playerGameData.winner;

            let getUserInfo = (targetUserId) => roomData.users.filter(x => x.id == targetUserId)[0];

            let userInfo = getUserInfo(winner.userId);

            let totals = "SCORES: \n";
            roomData.playerGameData.results.forEach(x => totals += `${getUserInfo(x.userId).name} : ${x.answerResults}`);

            let instructions = {
                type: "Display",
                comp: "ResultScreen",
                title: `${userInfo.name} was the winner with a total of ${winner.answerResults} correct answers!`,
                msg: totals
            }

            roomData.currentInstructions = instructions;

            return roomData;
        });


    }




    //Functions called from from Vue component--------------------------------------------------------------------------

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
        //return gd;
    }

    //Check function - Go to the next step if all players are done submitting answers
    checkToSeeIfAllPlayersAreDone = function (remoteDataGroup, userId) {

        if (userId == remoteDataGroup.hostId) {

            let res = remoteDataGroup.playerGameData.results;

            if (res && res.length == remoteDataGroup.userList.length)
                this.moveToStep(3);
        }

    }

    //Go to the desired step
    moveToStep = function (stepNumber) {
/*
        this.dataConnector.updatePlayerGameDataViaFunction(this.roomName, (playerGameData) => {

            //Clean out display vars
            let instructionProps = ["currentCheckInstructions", "currentInstructions"];
            instructionProps.forEach(name => {
                playerGameData[name] = null;
            });

            //Update Step
            playerGameData.currentStep = stepNumber

            return playerGameData;
        });

  */      
        this.dataConnector.updateWholeRoomViaFunction(this.roomName, (roomData) => {

            roomData.currentInstructions = null;
            roomData.currentCheckInstructions = null;
            roomData.playerGameData.currentStep = stepNumber;
            return roomData;
        });
    }

    //Null out player instruction
    /*
    cleanInstructions = function () {
        let instructionProps = ["currentCheckInstructions", "currentInstructions"]
        this.dataConnector.cleanPlayerGameData(this.roomName, instructionProps);
    }
    */



    //General "Private" functions -----------------------------------------------------------------

    
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


