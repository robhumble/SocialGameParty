import * as sgf from "@/logic/socialGameFramework.js";

import BaseGame from "@/logic/Games/BaseGame.js";

import Card from "@/logic/Cards/Card.js";
import DeckOfCards from "@/logic/Cards/DeckOfCards.js";

import ActivePlayerGameDataConnector from "@/dataConnectors/ActivePlayerGameDataConnector.js";
import HostGameDataConnector from "@/dataConnectors/HostGameDataConnector.js";


export default class BlackJackGame extends BaseGame {


    constructor(roomName) {

        super();

        this.name = "BlackJack";
        this.roomName = roomName;
        this.loadGameSteps();

        //Setup Configuration
        this.#configOptions.startingMoney = 100;

    }


    /*
    GENERAL RULES FOR BLACKJACK---------------------
    https://bicyclecards.com/how-to-play/blackjack/
    http://www.hitorstand.net/strategy.php  (simpler rules)
    https://www.businessinsider.com/blackjack-basics-2014-6
    https://www.quora.com/What-happens-if-a-dealer-and-player-have-blackjack



    BASIC RULES --------------------------------------

    Ace is either 1 or 11
    Face cards are 10
    Number cards are their value                

    Host Machine is dealer/House
    Host user still gets a turn but goes last (second to last....before the dealer/machine).

    Everyone starts at $100
    Minimum bet is $5
    No Max Bet

    On a "BlackJack" (natural 21), the winner gets their bet back + 1.5x their bet from the dealer 
    On a "win" the winner gets their bet back + 1x their bet from the dealer 
    On a "loss" the loser loses their bet
    On dealer "BlackJack", any other players with "BlackJack" get their bets back, all other players lose

    BlackJack/Natrual 21 is auto win for the player
    Hit gets another card
    Can hit until you go over 21 (at which point you lose/BUST)
    Stand stays 

    Dealer goes last. - Dealer hits until 17 or over

    After the dealer goes everyone settles up (winners get paid)

    Game is over when only a single player has money left OR when the host cancels the game (at that point the winner is whoever has the most money.)



    BASIC LOOP--------------------------------------

    1) Instantiate/Shuffle New Deck
    2) Each player makes a bet
    3) Machine/dealer deals cards face up to everyone, dealers second card is hidden
    4) Evaluate current cards for Naturals - Determine if there's is a need to PUSH (i.e. player and dealer both have black jack)
    5) Pass control to each player in order so they can run their turn
    6) Machine/dealer runs their turn
    7) Machine/dealer evaluates and determine who gets money and/or who is out.
    8) Machine/dealer gives option to host to continue or to end game early (which would declare the user with the most money as the winner)



    IMPLEMENTATION Ideas --------------------------------------

    Deck livess in ActiveGamePlayerData
    Hands lives in the ActiveGamePlayerData
    Discard lives in ActiveGamePlayerData (if we have one)
    On the players turn, when they select hit - their machine will pull from the deck and assign to their hands
    When a players turn is done, the ActiveGamePlayerData is updated with the new state of deck/hand/discard
    Spectator View should be implemented for this game, provides overall view of the game.
    Need concept of "Resetting Current Step to Step X"


    Stretch goals:

    Doubling - Doubling is like a hit, only the bet is doubled and you only get one more card.

    Splitting - Split can be done when you have two of the same card - the pair is split into two hands.
                Splitting also doubles the bet, because each new hand is worth the original bet.
                You can only double/split on the first move, or first move of a hand created by a split.
                You cannot play on two aces after they are split.
                You can double on a hand resulting from a split, tripling or quadrupling you bet.

    Insurance - Wager half your original bet to protect against the dealer having blackjack             
    
    !!!!!CONTINUE FROM HERE!!!!                
    
    */




    loadGameSteps() {
        this.gameSteps = [

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

            {
                /*
                Throw up loading screen
                Populate active gameplayerData
                
                */
            },

            {
                //1) Instantiate/Shuffle New Deck

                stepNum: 1,
                desc: "Instantiate/Shuffle New Deck",
                cleanInstructionsFirst: false,

                preStepTarget: 'host',
                preStepFunction: (d) => { return this.setupLoadingScreen(data, batch) },

                target: 'host',
                stepFunction: (d) => { return this.setupBlackJack(data, batch) },

                // followUpTarget: 'none',
                // followUpFunction:  (d) => { return this.followUp(d) },

                // checkTarget: 'host',
                // checkFunction: (d) => { return this.prepareCheckInstructions(d) }
            },
            {
                //2) Each player makes a bet

                stepNum: 2,
                desc: "Each player makes a bet",
                cleanInstructionsFirst: false,

                // preStepTarget: 'host',
                // preStepFunction: (d) => { return this.setupLoadingScreen(d) },

                // target: 'host',
                // stepFunction: (d) => { return this.setupBlackJack(d) },

                // followUpTarget: 'none',
                // followUpFunction:  (d) => { return this.followUp(d) },

                // checkTarget: 'host',
                // checkFunction: (d) => { return this.prepareCheckInstructions(d) }
            },
            {
                //3) Machine/dealer deals cards face up to everyone, dealers second card is hidden
            },
            {
                //4) Evaluate current cards for Naturals - Determine if there's is a need to PUSH (i.e. player and dealer both have black jack)
            },
            {
                //5) Pass control to each player in order so they can run their turn
            },
            {
                //6) Machine/dealer runs their turn
            },
            {
                //7) Machine/dealer evaluates and determine who gets money and/or who is out.
            },
            {
                //8) Machine/dealer gives option to host to continue or to end game early (which would declare the user with the most money as the winner)
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


    setupBlackJack = function (remoteDataGroup, batch) {

        //SetUp the deck 
        let deck = new DeckOfCards();
        deck.populateTraditionalDeck();
        deck.shuffleDeck();

        let cardsInDeck = deck.CardArray;


        //Setup player hands
        let playerInfo = [];
        players = remoteDataGroup.userList.filter((x) => x.isPlaying);
        players.forEach((x) => {

            let ph = {
                id: x.id,
                name: x.name,
                cards: [],
                money: this.#configOptions.startingMoney
            }
            playerInfo.push(ph);

        })

        //Add to the writeBatch
        let dataToUpdate = {

            dynamicPlayerGameData: {
                cardsInDeck: cardsInDeck,
                playerInfo: playerInfo
            },
            currentStep: 2

        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }





    //Functions called from from Vue component (These generally run in their own transaction - NOT BATCH )--------------------------------------------------------------------------
    /*
     * Each of the functions below is designed to be called by callGameFunction() in the game runner.  These functions expect the following params.
     *
     * remoteDataGroup - data we listen to and keep in the GlobalPropertyModule vuex store.
     * userId - the userId of the user calling the function
     * (OPTIONAL)functionParams - an additional object that contains function params, can be named anything, can be an object with multiple params nested inside.
     */





    //General "Private" Helper functions -----------------------------------------------------------------






}


