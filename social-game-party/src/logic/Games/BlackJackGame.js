import * as sgf from "@/logic/socialGameFramework.js";

import BaseGame from "@/logic/Games/BaseGame.js";

import ActivePlayerGameDataConnector from "@/dataConnectors/ActivePlayerGameDataConnector.js";
import HostGameDataConnector from "@/dataConnectors/HostGameDataConnector.js";


export default class BlackJackGame extends BaseGame {


    constructor(roomName) {

        super();

        this.name = "BlackJack";
        this.roomName = roomName;
        this.loadGameSteps();
    }


    
    loadGameSteps() {
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



                /*
                GENERAL RULES FOR BLACKJACK---------------------
                https://bicyclecards.com/how-to-play/blackjack/
                http://www.hitorstand.net/strategy.php  (simpler rules)

                
                Ace is either 1 or 11
                Face cards are 10
                Number cards are thier value                

                Host Machine is dealer/House
                Host user still gets a turn but goes last.

                Everyone starts at $100
                Minimum bet is $5
                No Max Bet

                On a "win" the winner gets 1.5x thier bet
                On a "loss" the loser loses thier bet

                Hit gets another call
                Stand stays 

                
                !!!!!CONTINUE FROM HERE!!!!

                
                
                */









            {
              
                /*
                Throw up loading screen
                Populate active gameplayer
                
                */



            },


        ];
    };


    //Main step functions - (These generally are batched writes)-------------------------------------------------------
    /*
     * Each of these functions below are supposed to be run exclusively by the host.  Each expects the following params
     * 
     * remoteDataGroup - data we listen to and keep in the GlobalPropertyModule vuex store.
     * batch - a write batch, generally there is one per step that is passed in and out of each main step function until the step is completed... at which point we commit the write batch.
     */





    //Functions called from from Vue component (These generally run in thier own transaction - NOT BATCH )--------------------------------------------------------------------------
    /*
     * Each of the functions below is designed to be called by callGameFunction() in the game runner.  These functions expect the following params.
     *
     * remoteDataGroup - data we listen to and keep in the GlobalPropertyModule vuex store.
     * userId - the userId of the user calling the function
     * (OPTIONAL)functionParams - an additional object that contains function params, can be named anything, can be an object with multiple params nested inside.
     */





    //General "Private" Helper functions -----------------------------------------------------------------






}


