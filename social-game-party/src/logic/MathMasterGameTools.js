export default class MathMasterGameTools {

    // #mathProblemConfig = {
    //     problemLo = 0,
    //     problemHi = 100
    // }

    constructor() { }


    gameSteps = [

        {
            stepNum: 1,
            target: 'all',
            desc: "wait for all players to be ready"
        },
        {
            stepNum: 2,
            target: 'host',
            desc: "Build out problems",
            stepFunction: this.buildProblemsStep,
            followUpFunction: this.buildProblemsFollowUp
        },
        {
            stepNum: 3,
            target: 'all',
            desc: "players answer problems",
            stepFunction: this.mainGameStep,
            followUpFunction: null
        },
        {
            stepNum: 4,
            target: 'host',
            desc: "Determine winner"
        },
        {
            stepNum: 5,
            target: 'all',
            desc: "Display winner"
        },
        

    ];


    //Step 2 - Build Math Problem

    mathProblems = [];

    buildProblemsStep = function () {

        let problemsToBuild = 10;

        for (let x = 0; x < problemsToBuild; x++) {
            let prob = this.buildMathProblem();
            this.mathProblems.push(prob);
        }
    }

    //TODO: this function should call a data connector to write the math problems to the db.
    buildProblemsFollowUp = function () {
        throw Error('Not Yet Implemented!');
    }

    //TODO: this function should go through each problem, launch a question and answer component, and record the answer
    //Step 3 - Main Game Step
    mainGameStep =  function(mathProblems){
        throw Error('Not Yet Implemented!'+mathProblems);
    }








    //General functions -----------------------------------------------------------------

    buildMathProblem = function () {

        let problemLo = 0,
            problemHi = 100

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


