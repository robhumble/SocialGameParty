import * as sgf from "@/logic/socialGameFramework.js";

import BaseGame from "@/logic/Games/BaseGame.js";

import Card from "@/logic/Cards/Card.js";
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
                preStepFunction: (data, batch) => { return this.setupLoadingScreen(data, batch) },

                target: 'host',
                stepFunction: (data, batch) => { return this.setupBlackJack(data, batch) },

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

                target: 'host',
                stepFunction: (data, batch) => { return this.askPlayersForBets(data, batch) },

                // followUpTarget: 'none',
                // followUpFunction:  (d) => { return this.followUp(d) },

                checkTarget: 'host',
                checkFunction: (data, batch) => { return this.setUpCheckForAllBets(data, batch) }
            },
            {
                //3) Machine/dealer deals cards face up to everyone, dealers second card is hidden

                stepNum: 3,
                desc: "Machine/dealer deals cards face up to everyone, dealers second card is hidden",
                cleanInstructionsFirst: false,

                // preStepTarget: 'host',
                // preStepFunction: (d) => { return this.setupLoadingScreen(d) },

                target: 'host',
                stepFunction: (data, batch) => { return this.dealCardsToEachPlayer(data, batch) },

                // followUpTarget: 'none',
                // followUpFunction:  (d) => { return this.followUp(d) },

                // checkTarget: 'host',
                // checkFunction: (d) => { return this.setUpCheckForAllBets(d) }
            },
            {
                //4) Evaluate current cards for Naturals - Determine if there's is a need to PUSH (i.e. player and dealer both have black jack)

                stepNum: 4,
                desc: "Evaluate current cards for Naturals - Determine if there's is a need to PUSH (i.e. player and dealer both have black jack)",
                cleanInstructionsFirst: false,

                // preStepTarget: 'host',
                // preStepFunction: (d) => { return this.setupLoadingScreen(d) },

                target: 'host',
                stepFunction: (data, batch) => { return this.checkForNaturals(data, batch) },

                // followUpTarget: 'none',
                // followUpFunction:  (d) => { return this.followUp(d) },

                // checkTarget: 'host',
                // checkFunction: (d) => { return this.setUpCheckForAllBets(d) }
            },
            {
                //5) Pass control to each player in order so they can run their turn

                stepNum: 5,
                desc: "Pass control to each player in order so they can run their turn",
                cleanInstructionsFirst: false,

                // preStepTarget: 'host',
                // preStepFunction: (d) => { return this.setupLoadingScreen(d) },

                target: 'host',
                stepFunction: (data, batch) => { return this.setUpMainGameRounds(data, batch) },

                // followUpTarget: 'none',
                // followUpFunction:  (d) => { return this.followUp(d) },

                checkTarget: 'host',
                checkFunction: (data, batch) => { return this.setUpCheckForEndOfPlayerTurn(data, batch) }

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

        playerInfo.push(dh);



        //prep for storage
        let preparedDeck = deck.toMap();
        playerInfo.forEach(x => x.cards = this.convertCardArrayToMapArray(x.cards));


        //Add to the writeBatch
        let dataToUpdate = {

            dynamicPlayerGameData: {
                cardDeck: preparedDeck,
                playerInfo: playerInfo
            },
            currentStep: 2

        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }



    //host asks players for the bets
    askPlayersForBets = function (remoteDataGroup, batch) {

        let qaInstructions = sgf.mainFramework.gameTools.buildQuestionAndAnswerInstructions(
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


    dealCardsToEachPlayer = function (remoteDataGroup, batch) {

        if (!remoteDataGroup) sgf.mainFramework.megaLog('no remoteDataGroup in prepareCheckInstructions');

        let gameDeck = new DeckOfCards();
        gameDeck.fromMap(remoteDataGroup.playerGameData.cardDeck);


        let playerInfo = remoteDataGroup.playerGameData.playerInfo;

        //Deal round 1        
        playerInfo.forEach((player) => {

            let c = gameDeck.dealACard();
            c.isFaceUp = true;

            player.cards.push(c.toMap());
        })

        //Deal round 2
        playerInfo.forEach((player) => {

            let c = gameDeck.dealACard();

            if (player.Id == "dealer")
                c.isFaceUp = false;
            else
                c.isFaceUp = true;

            player.cards.push(c.toMap());
        })


        //Add to the writeBatch
        let dataToUpdate = {

            dynamicPlayerGameData: {
                cardsInDeck: gameDeck.toMap(),
                playerInfo: playerInfo
            },
            currentStep: 4

        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);

    }

    //Following natural rules from https://bicyclecards.com/how-to-play/blackjack/
    checkForNaturals = function (remoteDataGroup, batch) {
        if (!remoteDataGroup) sgf.mainFramework.megaLog('no remoteDataGroup in prepareCheckInstructions');

        let playerInfo = remoteDataGroup.playerGameData.playerInfo;

        let playerIdsWithNaturals = [];
        let dealerHasNatural = false;

        playerInfo.forEach(x => {

            let handVal = this.getHandValue(x.cards);

            if (handVal == 21) {
                if (x.id == "dealer")
                    dealerHasNatural = true;
                else
                    playerIdsWithNaturals.push(x.id);
            }

        });

        let nextStep = 5;

        if (dealerHasNatural) {

            //If a dealer has a natural the round is over
            //Collect bets of players who do not have naturals
            //If players have naturals - it's a tie and they get their bets back.
            playerInfo.forEach(x => {

                if (playerIdsWithNaturals.includes(x.id)) {
                    x.bet = null;
                    x.turnComplete = true;
                }
                else {
                    x.money -= x.bet;
                    x.bet = null;
                    x.turnComplete = true;
                }
            });

            //If the dealer has a natural, the round is over so skip to the end;
            nextStep = 8;

        }
        else {
            //If a player has a natural and the dealer doesn't
            //Return their bet and pay out 1.5 times their bet - the round is done for that player (mark it so)

            playerInfo.forEach(x => {

                if (playerIdsWithNaturals.includes(x.id)) {
                    x.money += (x.money * this.configOptions.naturalMultiplier)
                    x.bet = null;
                    x.turnComplete = true;
                }
            });

        }

        //Add to the writeBatch
        let dataToUpdate = {

            dynamicPlayerGameData: {
                playerInfo: playerInfo
            },
            currentStep: nextStep

        };

        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);
    }


    setUpMainGameRounds = function (remoteDataGroup, batch) {

        //TODO: need to test this!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        let playerInfo = remoteDataGroup.playerGameData.playerInfo;        

        //TODO: do a loading screen for all players here
        batch = this.setupLoadingScreen(remoteDataGroup, batch)


        //Call first players turn setup function
        let firstPlayerId = playerInfo[0].id;
        let dataToUpdate = this.setupPlayersTurn(firstPlayerId)

        //TODO: initialize whatever data needs to be initialized - i.e. currentPlayerIndex = 0; allRoundsComplete = false (add to the batch)
        dataToUpdate.currentPlayerIndex = 0; 
        dataToUpdate.allRoundsComplete = false


        return this.activePlayerGameDataConnector.activePlayerGameDataAddToBatch(batch, "update", this.roomName, dataToUpdate);





    }

    setUpCheckForEndOfPlayerTurn = function (remoteDataGroup, batch) {

        if (!remoteDataGroup || !batch) console.log('oh no!')

        //Setup check instructions to evaluate the end of a players turn

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

    checkForAllBetsIn = function (remoteDataGroup, userId) {

        //TODO - Host check seems redundant...         
        if (userId == remoteDataGroup.hostId) {


            let betCount = remoteDataGroup.playerGameData.playerInfo.filter(x => x.bet != null).length;
            let playerCount = this.getActivePlayerCount(remoteDataGroup);

            if (betCount == playerCount) {
                //Move to step 3 (and clear all existing instructions.)           

                this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (roomData) => {
                    roomData.currentStep = 3;
                    roomData.currentCheckInstructions = null;
                    roomData.currentInstructions = null;
                    return roomData;
                });
            }
        }

    }

    writePlayerRoundResults = function (remoteDataGroup, userId, answerResults) {


        if (!remoteDataGroup || !userId || !answerResults) console.log('oh no!')

        // this.activePlayerGameDataConnector.updateWholeActivePlayerGameDataViaFunction(this.roomName, (aData) => {

        //     //Update the player info with the bet made in the UI()
        //     aData.dynamicPlayerGameData.playerInfo.filter(x => x.id == userId)
        //         .forEach((x) => {
        //             x.bet = answerResults;
        //         });

        //     return aData;
        // });

    }




    //General "Private" Helper functions -----------------------------------------------------------------

    buildPlayerInfoObj() {

        let ph = {
            id: null,
            name: null,
            cards: [],
            money: null,
            bet: null,
            turnComplete: false
        }

        return ph;

    }

    convertCardArrayToMapArray(cardArray) {

        let cardMapArray = [];
        cardArray.forEach(x => cardMapArray.push(x.toMap()));

        return cardMapArray;
    }

    getCardArrayFromMapArray(mapArray) {

        let cardArray = [];

        mapArray.forEach((x) => {
            let c = new Card();
            cardArray.push(c.fromMap(x));
        });

        return cardArray;
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

            if (faceVals.some(x => x == cur.Value))
                return acc + 10;

            if (cur.Value == "A")
                return acc + 11;
        });

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


    setupPlayersTurn(playerToSetupId) {


        // !~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~!~
        // TODO: Continue implementation here next time......
        //WORKING IN THE SGF to make a function to build the needed config object for the card table....which we will then set up here and put into the "currentTargetedInstructions"



        if (!playerToSetupId) console.log('oh no!')

        //TODO: sort this out


        //Create notion of "targetPlayerInstructions" - should be an array of instructions and we identify the specific players by id

        //Clear existing "targetPlayerInstructions"

        //Create display instructions for a specific player
        //Display instructions render the card table 
        //Card table accepts a config object to describe the rules we want to use for black jack  (i.e. where is the deck i should use? where is the hand I should use? expose the hit control,  
        //expose the stay control, name of call back function to use to update the results  PROBABLY writePlayerRoundResults())



        //TODO: Create a data object for a write batch and return it;

        let dataToUpdate = {

            // dynamicPlayerGameData: {             
            //     playerInfo: playerInfo
            // },
            // currentStep: nextStep

        };


        return dataToUpdate;
    }



}


