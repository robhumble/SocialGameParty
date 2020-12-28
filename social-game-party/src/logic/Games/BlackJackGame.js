import * as sgf from "@/logic/socialGameFramework.js";

import BaseGame from "@/logic/Games/BaseGame.js";

//import Card from "@/logic/Cards/Card.js";
import DeckOfCards from "@/logic/Cards/DeckOfCards.js";

//import ActivePlayerGameDataConnector from "@/dataConnectors/ActivePlayerGameDataConnector.js";
//import HostGameDataConnector from "@/dataConnectors/HostGameDataConnector.js";


export default class BlackJackGame extends BaseGame {


    constructor(roomName) {

        super();

        this.name = "BlackJack";
        this.roomName = roomName;
        this.loadGameSteps();

        //Setup Configuration
        this.configOptions.startingMoney = 100;
        this.configOptions.naturalMultiplier = 1.5;



        this.convertCardArrayToMapArray = sgf.mainFramework.gameTools.convertCardArrayToMapArray;
        this.getCardArrayFromMapArray = sgf.mainFramework.gameTools.getCardArrayFromMapArray;

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
    6a) Machine/dealer runs their turn
    6b) Machine/dealer evaluates and determine who gets money and/or who is out.
    7) Machine/dealer gives option to host to continue or to end game early (which would declare the user with the most money as the winner)
    8) Host has chosen to end the game - show a final end screen


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
                preStepFunction: (data, batch) => { return this.setupLoadingScreen(data, batch) },

                target: 'host',
                stepFunction: (data, batch) => { return this.setupBlackJack(data, batch) },
            },

            {
                //1) Reset Game - Set things up for another round.
                stepNum: '1B',
                desc: "Reset Game - Set things up for another round.",
                cleanInstructionsFirst: true,

                preStepTarget: 'host',
                preStepFunction: (data, batch) => { return this.setupLoadingScreen(data, batch) },

                target: 'host',
                stepFunction: (data, batch) => { return this.resetBlackJackForAnotherRound(data, batch) },
            },


            {
                //2) Each player makes a bet

                stepNum: 2,
                desc: "Each player makes a bet",
                cleanInstructionsFirst: false,

                target: 'host',
                stepFunction: (data, batch) => { return this.askPlayersForBets(data, batch) },

                checkTarget: 'host',
                checkFunction: (data, batch) => { return this.setUpCheckForAllBets(data, batch) }
            },
            {
                //3) Machine/dealer deals cards face up to everyone, dealers second card is hidden

                stepNum: 3,
                desc: "Machine/dealer deals cards face up to everyone, dealers second card is hidden",
                cleanInstructionsFirst: false,

                target: 'host',
                stepFunction: (data, batch) => { return this.dealCardsToEachPlayer(data, batch) },
            },
            {
                //4) Evaluate current cards for Naturals - Determine if there's is a need to PUSH (i.e. player and dealer both have black jack)

                stepNum: 4,
                desc: "Evaluate current cards for Naturals - Determine if there's is a need to PUSH (i.e. player and dealer both have black jack)",
                cleanInstructionsFirst: false,

                target: 'host',
                stepFunction: (data, batch) => { return this.checkForNaturals(data, batch) },

            },
            {
                //5) Pass control to each player in order so they can run their turn

                stepNum: 5,
                desc: "Pass control to each player in order so they can run their turn",
                cleanInstructionsFirst: false,

                target: 'host',
                stepFunction: (data, batch) => { return this.setUpMainGameRounds(data, batch) },

                checkTarget: 'host',
                checkFunction: (data, batch) => { return this.setUpCheckForEndOfPlayerTurn(data, batch) }

            },
            /*
            {
                //6a) Machine/dealer runs their turn
                //6b) Machine/dealer evaluates and determine who gets money and/or who is out.

                stepNum: 6,
                desc: "Machine/dealer runs end of turn tasks",
                cleanInstructionsFirst: false,

                // preStepTarget: 'host',
                // preStepFunction: (d) => { return this.setupLoadingScreen(d) },

                target: 'host',
                stepFunction: (data, batch) => { return this.runMachineDealerEndOfTurnTasks(data, batch) },

            },
            */

            /*
            {
                //7) Machine/dealer gives option to host to continue or to end game early (which would declare the user with the most money as the winner)


                stepNum: 7,
                desc: "Machine/dealer gives option to host to continue or to end game early (which would declare the user with the most money as the winner)",
                cleanInstructionsFirst: false,
          
                target: 'host',
                stepFunction: (data, batch) => { return this.setupEndOfRoundOptions(data, batch) },
            },
            */


            {
                //8) Host has chosen to end the game - show a final end screen


                stepNum: 8,
                desc: "Host has chosen to end the game - show a final end screen",
                cleanInstructionsFirst: true,

                target: 'host',
                stepFunction: (data, batch) => { return this.showTheFinalScreen(data, batch) },
            },





        ];
    }


    //Main step functions - (These generally are batched writes)-------------------------------------------------------
    /*
     * Each of these functions below are supposed to be run exclusively by the host.  Each expects the following params
     * 
     * function (remoteDataGroup, batch)
     * 
     * remoteDataGroup - data we listen to and keep in the GlobalPropertyModule vuex store.
     * batch - a write batch, generally there is one per step that is passed in and out of each main step function until the step is completed... at which point we commit the write batch.
     */


    //Step 1
    //Set up the deck and the playerinfo (hand, money)
    setupBlackJack = function (remoteDataGroup, batch) {

        //SetUp the deck 
        let deck = new DeckOfCards();
        deck.populateTraditionalDeck();
        deck.shuffleDeck();

        //Setup player hands
        let playerInfo = [];
        let players = remoteDataGroup.userList.filter((x) => x.isPlaying);
        players.forEach((x) => {

            let ph = this.buildPlayerInfoObj();

            ph.id = x.id;
            ph.name = x.name;
            ph.money = this.configOptions.startingMoney;

            playerInfo.push(ph);

        })

        //Add hand for the dealer        
        let dh = this.buildPlayerInfoObj();

        dh.id = "dealer";
        dh.name = "dealer";
        dh.money = this.configOptions.startingMoney;

        //playerInfo.push(dh);



        //prep for storage
        let preparedDeck = deck.toMap();
        playerInfo.forEach(x => x.cards = this.convertCardArrayToMapArray(x.cards));
        dh.cards = this.convertCardArrayToMapArray(dh.cards);


        //Add to the writeBatch
        let dataToUpdate = {

            dynamicPlayerGameData: {
                cardDeck: preparedDeck,
                playerInfo: playerInfo,
                dealerInfo: dh
            },
            currentStep: 2

        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }

    //Step 1B
    //Set things up for another round
    resetBlackJackForAnotherRound = function (remoteDataGroup, batch) {

        //SetUp the deck 
        let deck = new DeckOfCards();
        deck.populateTraditionalDeck();
        deck.shuffleDeck();

        //Reset player hands.
        let playerInfo = remoteDataGroup.playerGameData.playerInfo;
        playerInfo.forEach(x => {
            x.cards = [];
            x.bet = null;
            x.finalHandTotal = 0;
            x.turnComplete = false;
            x.bust = false;
            x.paidOutForTheRound = false;
        });


        //Reset Dealer
        let dh = remoteDataGroup.playerGameData.dealerInfo;
        dh.cards = [];
        dh.bet = null;
        dh.finalHandTotal = 0;
        dh.turnComplete = false;
        dh.bust = false;
        dh.paidOutForTheRound = false;

        //prep for storage
        let preparedDeck = deck.toMap();
        playerInfo.forEach(x => x.cards = this.convertCardArrayToMapArray(x.cards));
        dh.cards = this.convertCardArrayToMapArray(dh.cards);

        //Add to the writeBatch
        let dataToUpdate = {

            // dynamicPlayerGameData: {
            //     cardDeck: preparedDeck,
            //     playerInfo: playerInfo,
            //     dealerInfo: dh
            // },

            "dynamicPlayerGameData.cardDeck": preparedDeck,
            "dynamicPlayerGameData.playerInfo": playerInfo,
            "dynamicPlayerGameData.dealerInfo": dh,


            currentStep: 2

        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }


    //Step 2
    //host asks players for the bets
    askPlayersForBets = function (remoteDataGroup, batch) {

        let qaInstructions = sgf.mainFramework.gameTools.buildQuestionAndAnswerInstructions(
            sgf.mainFramework.gameTools.gameComponents.QuestionAndAnswer,
            "How much will you bet?", //question Text
            "writePlayerBet" //follow up function
        );

        let dataToUpdate = {
            currentInstructions: qaInstructions
        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);

    }


    //host sets up a check that all bets have been turned in
    setUpCheckForAllBets = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) sgf.mainFramework.megaLog('no remoteDataGroup in prepareCheckInstructions');

        let currentCheckInstructions = sgf.mainFramework.gameTools.buildCheckInstructions(
            sgf.mainFramework.gameTools.rootObjects.player,
            "playerInfo",
            "checkForAllBetsIn");

        //Add to the writeBatch
        let dataToUpdate = {
            currentCheckInstructions: currentCheckInstructions
        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);

    }

    //Step 3
    //Deal cards
    dealCardsToEachPlayer = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) sgf.mainFramework.megaLog('no remoteDataGroup in prepareCheckInstructions');

        let gameDeck = new DeckOfCards();
        gameDeck.fromMap(remoteDataGroup.playerGameData.cardDeck);


        let playerInfo = remoteDataGroup.playerGameData.playerInfo;

        //Deal a face up card to each player    
        playerInfo.forEach((player) => {

            let c = gameDeck.dealACard();
            c.isFaceUp = true;

            player.cards.push(c.toMap());
        })

        //Deal a face down card to each player
        playerInfo.forEach((player) => {
            let c = gameDeck.dealACard();
            c.isFaceUp = true;
            player.cards.push(c.toMap());
        })


        //Deal 2 cards to the dealer.
        let dealerInfo = remoteDataGroup.playerGameData.dealerInfo;
        let c1 = gameDeck.dealACard();
        let c2 = gameDeck.dealACard();
        dealerInfo.cards.push(c1.toMap(), c2.toMap());




        //Add to the writeBatch
        let dataToUpdate = {

            // dynamicPlayerGameData: {
            //     cardsInDeck: gameDeck.toMap(),
            //     playerInfo: playerInfo
            // },

            "dynamicPlayerGameData.cardDeck": gameDeck.toMap(),
            "dynamicPlayerGameData.playerInfo": playerInfo,
            "dynamicPlayerGameData.dealerInfo": dealerInfo,

            currentStep: 4

        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);

    }

    //Step 4
    //Following natural rules from https://bicyclecards.com/how-to-play/blackjack/
    checkForNaturals = function (remoteDataGroup, batch) {
        if (!remoteDataGroup) sgf.mainFramework.megaLog('no remoteDataGroup in prepareCheckInstructions');

        //Check players for naturals
        let playerInfo = remoteDataGroup.playerGameData.playerInfo;
        let playerIdsWithNaturals = [];

        playerInfo.forEach(x => {

            let handVal = this.getHandValue(x.cards);

            if (handVal == 21)
                playerIdsWithNaturals.push(x.id);
        });


        //Check dealer for natural
        let dealerInfo = remoteDataGroup.playerGameData.dealerInfo;
        let dealerHasNatural = false;

        if (this.getHandValue(dealerInfo.cards) == 21)
            dealerHasNatural = true;


        let nextStep = 5;

        if (dealerHasNatural) {

            //If a dealer has a natural the round is over
            //Collect bets of players who do not have naturals
            //If players have naturals - it's a tie and they get their bets back.
            playerInfo.forEach(x => {

                if (playerIdsWithNaturals.includes(x.id)) {
                    x.bet = null;
                    x.turnComplete = true;
                    x.paidOutForTheRound = true;
                }
                else {
                    x.money = parseInt(x.money) - parseInt(x.bet);
                    x.bet = null;
                    x.turnComplete = true;
                    x.paidOutForTheRound = true;
                }
            });

            //If the dealer has a natural, the round is over so skip to the end;
            //nextStep = 7;

            let endOfRoundInstructions = this.setupEndOfRoundOptions(remoteDataGroup);

            //Add to the writeBatch
            let dataToUpdate = {

                // dynamicPlayerGameData: {
                //     playerInfo: playerInfo
                // },
                "dynamicPlayerGameData.playerInfo": playerInfo,

                //currentStep: nextStep
                currentInstructions: endOfRoundInstructions.currentInstructions,
                currentTargetedInstructions: endOfRoundInstructions.currentTargetedInstructions,

            };

            return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);

        }
        else {
            //If a player has a natural and the dealer doesn't
            //Return their bet and pay out 1.5 times their bet - the round is done for that player (mark it so)

            playerInfo.forEach(x => {

                if (playerIdsWithNaturals.includes(x.id)) {
                    x.money += (parseInt(x.money) * parseInt(this.configOptions.naturalMultiplier))
                    x.bet = null;
                    x.turnComplete = true;
                    x.paidOutForTheRound = true;
                }
            });

            //Add to the writeBatch
            let dataToUpdate = {

                // dynamicPlayerGameData: {
                //     playerInfo: playerInfo
                // },
                "dynamicPlayerGameData.playerInfo": playerInfo,

                currentStep: nextStep
            };

            return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);

        }


    }


    //Step 5
    //Kick off the main game rounds by setting up the play phase for the first player
    setUpMainGameRounds = function (remoteDataGroup, batch) {

        //TODO: need to test this!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        let playerInfo = remoteDataGroup.playerGameData.playerInfo;

        //TODO: do a loading screen for all players here
        batch = this.setupLoadingScreen(remoteDataGroup, batch)


        //Call first players turn setup function
        let firstPlayerId = playerInfo[0].id;
        let targetedInstructions = this.setupTargetedInstructionsForPlayersTurn(firstPlayerId);

        let dataToUpdate = {

            // dynamicPlayerGameData: {
            //     currentPlayerIndex: 0,
            //     allRoundsComplete: false
            // },
            "dynamicPlayerGameData.currentPlayerIndex": 0,
            "dynamicPlayerGameData.allRoundsComplete": false,



            currentTargetedInstructions: [targetedInstructions],

        };

        //TODO: initialize whatever data needs to be initialized - i.e. currentPlayerIndex = 0; allRoundsComplete = false (add to the batch)
        // dataToUpdate.currentPlayerIndex = 0; 
        // dataToUpdate.allRoundsComplete = false


        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }

    //Setup a check function for the Host to see if a player finished their turn
    setUpCheckForEndOfPlayerTurn = function (remoteDataGroup, batch) {

        if (!remoteDataGroup || !batch) console.log('oh no!')

        //Setup check instructions to evaluate the end of a players turn

        let currentCheckInstructions = sgf.mainFramework.gameTools.buildCheckInstructions(
            sgf.mainFramework.gameTools.rootObjects.player,
            "playerInfo",
            "checkForEndOfPlayersTurn");

        //Add to the writeBatch
        let dataToUpdate = {
            currentCheckInstructions: currentCheckInstructions
        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }





    //Step 8
    //Tally up the results and show all users the results screen
    showTheFinalScreen = function (remoteDataGroup, batch) {



        let playerInfo = remoteDataGroup.playerGameData.playerInfo;

        //sort players descending based on money.
        playerInfo.sort((a, b) => {
            return b.money - a.money;
        })

        //Title
        let topScore = playerInfo[0].money;
        let winners = playerInfo.filter(x => x.money == topScore);

        let winnerStr = "The game is over, your winner";
        winnerStr += (winners.length > 1) ? "'s are: " : " is: ";
        winners.forEach(x => {
            winnerStr += `${x.name}, \n`
        });

        //msg
        let msgStr = ''
        playerInfo.forEach(x => {
            msgStr += `${x.name} | final amount = $ ${x.money} \n`;
        });


        let generalInstructions = sgf.mainFramework.gameTools.buildSimpleDisplayInstructions(sgf.mainFramework.gameTools.gameComponents.ResultScreen,
            winnerStr,
            msgStr);

        let dataToUpdate = {
            currentInstructions: generalInstructions,
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


    //player writes their bet to the db
    writePlayerBet = function (remoteDataGroup, userId, answerResults) {


        this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {

            //Update the player info with the bet made in the UI()
            aData.dynamicPlayerGameData.playerInfo.filter(x => x.id == userId)
                .forEach((x) => {
                    x.bet = answerResults;
                });

            return aData;
        });

    }

    //Check to see if all players have made bets - if so move on to the next step
    checkForAllBetsIn = function (remoteDataGroup, userId) {

        //TODO - Host check seems redundant...         
        if (userId == remoteDataGroup.hostId) {


            let betCount = remoteDataGroup.playerGameData.playerInfo.filter(x => x.bet != null).length;
            let playerCount = this.getActivePlayerCount(remoteDataGroup);

            if (betCount == playerCount) {
                //Move to step 3 (and clear all existing instructions.)           

                this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {
                    aData.currentStep = 3;
                    aData.currentCheckInstructions = null;
                    aData.currentInstructions = null;
                    return aData;
                });
            }
        }

    }


    //Update the remote db with the new deck and playerinfo state after a player finishes thier turn/round   
    /*
    AnswerResults should expect an object that looks like this
 
    endTurnResult = {
          endTurnFunctionName: this.endTurnFunctionName,
          deck: this.cardDeck,
          hand: this.hand,
          finalHandValue: finalHandValue,
          isBust: isBust
        }
    */
    writePlayerRoundResults = function (remoteDataGroup, userId, answerResults) {



        if (!remoteDataGroup || !userId || !answerResults) console.log('oh no!')

        //let newPlayerInfoState = answerResults.newPlayerInfoState;

        let newDeck = answerResults.deck.toMap();
        let newHand = this.convertCardArrayToMapArray(answerResults.hand);




        this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {

            aData.dynamicPlayerGameData.cardDeck = newDeck;

            //Update the player info with the bet made in the UI()
            aData.dynamicPlayerGameData.playerInfo.filter(x => x.id == userId)
                .forEach((y) => {
                    //y.id = newPlayerInfoState.id;
                    //y.name = newPlayerInfoState.name;
                    y.cards = newHand;
                    //y.money = newPlayerInfoState.money;
                    //y.bet = newPlayerInfoState.bet;
                    y.finalHandTotal = answerResults.finalHandValue;
                    y.turnComplete = true;
                    y.bust = answerResults.isBust;
                });

            return aData;
        });

    }

    //Check to see if the current players turn is complete, if so move on to the next player OR move on to the next game step
    checkForEndOfPlayersTurn = function (remoteDataGroup, userId) {

        if (!remoteDataGroup || !userId) console.log('oh no!')

        let playerInfo = remoteDataGroup.playerGameData.playerInfo;


        let cpi = remoteDataGroup.playerGameData.currentPlayerIndex;

        if (playerInfo[cpi].turnComplete) {


            let nextIndex = cpi + 1;


            if (nextIndex < playerInfo.length) {

                //Still players left to go through - Setup the next players turn
                let targetedInstructions = this.setupTargetedInstructionsForPlayersTurn(playerInfo[nextIndex].id);

                this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {

                    aData.dynamicPlayerGameData.currentPlayerIndex = nextIndex;
                    aData.currentTargetedInstructions = [targetedInstructions];

                    return aData;
                });


            }
            else {

                //Now calling step 6 directly from this function

                this.runMachineDealerEndOfTurnTasks(remoteDataGroup);

                // //All rounds are complete - clean up and move on to the next step.
                // this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {

                //     if(aData.currentStep!=6){
                //     aData.dynamicPlayerGameData.allRoundsComplete = true;
                //     aData.currentStep = 6;
                //     aData.currentCheckInstructions = null;
                //     aData.currentInstructions = null;
                //     aData.currentTargetedInstructions = null;                    
                //     }
                //     return aData;
                // });

            }

        }

    }




    endOfRoundHostDecision = function (remoteDataGroup, userId, answerResults) {

        //for follow up function - yes sends us back to do step one OR an alternate step 1 that resets instead of initializing the game
        //No moves us to step 8 where we go into the results screen.

        //Continue do another round of stuff 
        if (answerResults === true || answerResults === "true") {

            this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {
                aData.currentStep = "1B";
                return aData;
            });
        }
        //Don't continue - everybody goes to the end results screen
        else {

            this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {
                aData.currentStep = 8;
                return aData;
            });
        }
    }


    //CARD TABLE SPECIFIC functions - (THESE ARE ADDITIONAL RESOURCE FUNCTIONS MEANT TO BE CALLED BY THE CARD TABLE COMPONENT)-------------------------------------------------------


    hitFunction(deck, hand) {

        let c = deck.dealACard();
        if (c) {
            c.isFaceUp = true;
            hand.push(c);
        }


        let handVal = this.getHandValue(hand);

        let isBust = (handVal > 21);

        let result = {
            deck: deck,
            hand: hand,
            handValue: handVal,
            readyForEnd: isBust,
            isBust: isBust
        }

        return result;
    }

    standFunction(deck, hand) {

        let handVal = this.getHandValue(hand);

        let result = {
            deck: deck,
            hand: hand,
            handValue: handVal,
            readyForEnd: true,
            isBust: false
        }

        return result;
    }






    //General "Private" Helper functions -----------------------------------------------------------------

    buildPlayerInfoObj() {

        let ph = {
            id: null,
            name: null,
            cards: [],
            money: null,
            bet: null,
            finalHandTotal: 0,
            turnComplete: false,
            bust: false,
            paidOutForTheRound: false
        }

        return ph;

    }



    /**
     * Using BlackJack rules attempt to get the value of a hand.
     * @param {array} cardArray 
     */
    getHandValue(cardArray) {

        // Ace is either 1 or 11
        // Face cards are 10
        // Number cards are their value 

        let faceVals = ["J", "Q", "K"];

        //Add up the total values of each card in the hand (assume ace is 11)
        var handValue = cardArray.reduce((acc, cur) => {

            if (parseInt(cur.Value))
                return acc + parseInt(cur.Value);

            else if (faceVals.some(x => x == cur.Value))
                return acc + 10;

            else if (cur.Value == "A")
                return acc + 11;
        }, 0);

        //If the handValue is over 21, check to see if there are aces.  If we have Aces, turn them into "1" by subtracting 10.  Go one by one to try and get below 21, if we succeed stop converting.
        if (handValue > 21) {
            let numOfAcesLeft = cardArray.filter(x => x.Value == "A").length;

            while (handValue > 21 && numOfAcesLeft > 0) {
                handValue -= 10;
                numOfAcesLeft--;
            }
        }

        return handValue;
    }



    //Get targetedInstructions for the passed in player ID - targeted instructions here should set up the card table component
    setupTargetedInstructionsForPlayersTurn(playerToSetupId) {



        if (!playerToSetupId) console.log('oh no!')

        //TODO: sort this out


        //Create notion of "targetPlayerInstructions" - should be an array of instructions and we identify the specific players by id

        //Clear existing "targetPlayerInstructions"

        //Create display instructions for a specific player
        //Display instructions render the card table 
        //Card table accepts a config object to describe the rules we want to use for black jack  (i.e. where is the deck i should use? where is the hand I should use? expose the hit control,  
        //expose the stay control, name of call back function to use to update the results  PROBABLY writePlayerRoundResults())


        //gameDeck.fromMap(remoteDataGroup.playerGameData.cardDeck);


        let gn = sgf.mainFramework.gameTools.gameList.BlackJack;

        //Location and names of the deck and player info maps.
        let dL = "playerGameData",
            dN = "cardDeck",
            pIL = "playerGameData",
            pIN = "playerInfo";

        let cardTableConfig = sgf.mainFramework.gameTools.buildCardTableConfig(gn, dL, dN, pIL, pIN);

        cardTableConfig.showCurrentPlayerHand = true;
        cardTableConfig.showHitControl = true;
        cardTableConfig.hitControlFunctionName = "hitFunction";
        cardTableConfig.showStandControl = true;
        cardTableConfig.standControlFunctionName = "standFunction";
        cardTableConfig.endTurnFunctionName = "writePlayerRoundResults";




        let targetedInstructions = sgf.mainFramework.gameTools.buildCardTableInstructions(cardTableConfig, playerToSetupId);

        return targetedInstructions;


    }


    //OLD Step 6 - Now only called in "checkForEndOfPlayersTurn()"
    runMachineDealerEndOfTurnTasks = function (remoteDataGroup) {
        if (!remoteDataGroup) console.log('oh no!')

        //TODO - This should prevent this from running multiple times.....why is this running multiple times.
        // if (remoteDataGroup.currentStep != 6)
        //     return batch;
        // else
        // {

        //6a) Machine/dealer runs their turn
        //...Dealer goes last. - Dealer hits until 17 or over
        let dealerInfo = remoteDataGroup.playerGameData.dealerInfo;
        let gameDeck = new DeckOfCards();
        gameDeck.fromMap(remoteDataGroup.playerGameData.cardDeck);

        //Hit until we have over 17                
        while (this.getHandValue(dealerInfo.cards) < 17) {
            let c = gameDeck.dealACard();
            dealerInfo.cards.push(c.toMap());
        }

        let finalDealerTotal = this.getHandValue(dealerInfo.cards);

        if (finalDealerTotal > 21)
            dealerInfo.bust = true;

        dealerInfo.finalHandTotal = finalDealerTotal;
        dealerInfo.turnComplete = true;
        dealerInfo.paidOutForTheRound = true;


        //6b) Machine/dealer evaluates and determine who gets money and/or who is out.
        // On a "win" the winner gets their bet back + 1x their bet from the dealer 
        // On a "loss" the loser loses their bet
        let playerInfo = remoteDataGroup.playerGameData.playerInfo;

        playerInfo.forEach(x => {

            //player lose
            if (x.bust || (!dealerInfo.bust && finalDealerTotal > x.finalHandTotal)) {
                x.money = parseInt(x.money) - parseInt(x.bet);
                x.bet = null;
                x.turnComplete = true;
                x.paidOutForTheRound = true;
            }

            //tie with dealer
            else if (finalDealerTotal == x.finalHandTotal && !x.bust && !dealerInfo.bust) {
                x.bet = null;
                x.turnComplete = true;
                x.paidOutForTheRound = true;
            }
            //player win
            else if ((dealerInfo.bust && !x.bust) || (finalDealerTotal < x.finalHandTotal && !x.bust)) {
                x.money = parseInt(x.money) + parseInt(x.bet);
                x.bet = null;
                x.turnComplete = true;
                x.paidOutForTheRound = true;
            }

        });

        /*
        //Add to the writeBatch
         let dataToUpdate = {
 
            // dynamicPlayerGameData: {
            //     cardDeck: gameDeck.toMap(),
            //     playerInfo: playerInfo,
            //     dealerInfo: dealerInfo
            // },
 
            "dynamicPlayerGameData.cardDeck": gameDeck.toMap(),
            "dynamicPlayerGameData.playerInfo": playerInfo,
            "dynamicPlayerGameData.dealerInfo": dealerInfo,
 
 
            currentStep: 7
        };
 
        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
        */

        //Calling this step directly from a check function now.....so no batch anymore

        //Replacing step 7 here
        var endOfRoundInstructions = this.setupEndOfRoundOptions(remoteDataGroup);

        //All rounds are complete - clean up and move on to the next step.
        this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {

            //Stuff we used to do in the check function
            aData.dynamicPlayerGameData.allRoundsComplete = true;
            aData.currentCheckInstructions = null;

            //Stuff from old step 6
            aData.dynamicPlayerGameData.cardDeck = gameDeck.toMap();
            aData.dynamicPlayerGameData.playerInfo = playerInfo;
            aData.dynamicPlayerGameData.dealerInfo = dealerInfo;                

            //Step 7
            aData.currentInstructions = endOfRoundInstructions.currentInstructions;
            aData.currentTargetedInstructions = endOfRoundInstructions.currentTargetedInstructions;            

            return aData;
        });




        //}


    }

    //OLD step 7 - Now called in "runMachineDealerEndOfTurnTasks()" and "checkForNaturals()""
    setupEndOfRoundOptions = function (remoteDataGroup) {

        if (!remoteDataGroup ) console.log('oh no!')

        //USE new YesNoQuestion Component to ask host if they want to keep playing or call it
        //should feed it a follow up function 

        //Host yes/No
        let comp = sgf.mainFramework.gameTools.gameComponents.YesNoQuestion;
        let questionText = "Do you weant to continue playing? (Yes starts another round, No will end the game here)";
        let followFunc = "endOfRoundHostDecision";

        let hostInstructions = sgf.mainFramework.gameTools.buildQuestionAndAnswerInstructions(comp, questionText, followFunc, remoteDataGroup.hostId);


        //All other players    
        let generalInstructions = sgf.mainFramework.gameTools.buildSimpleDisplayInstructions(sgf.mainFramework.gameTools.gameComponents.LoadingScreen,
            "Waiting....",
            "Waiting for host to decide whether the game continues...");

        let endOfRoundInstructions = {
            currentInstructions: generalInstructions,
            currentTargetedInstructions: [hostInstructions],
        };



        return endOfRoundInstructions;

    }




}


