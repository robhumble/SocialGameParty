import Card from "@/logic/Cards/Card.js";
//import CardCollection from "@/logic/Cards/CardCollection.js";
import * as sgf from "@/logic/socialGameFramework.js";

export default class DeckOfCards {

    //Traditional Cards --------------------------------
    traditionalSuits = [
        { name: "heart", color: "red" },
        { name: "diamond", color: "red" },
        { name: "spade", color: "black" },
        { name: "club", color: "black" },
    ]

    tradtionalValues = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
        "A",
    ]

    CardArray = []

    constructor() {
       // super();
    }


    populateTraditionalDeck() {

        this.CardArray = [];

        var it = 1;

        this.traditionalSuits.forEach(s => {
            this.tradtionalValues.forEach(v => {
                let newCard = new Card();
                newCard.populateTraditional(it, s.name, s.color, v);
                it++;
                this.CardArray.push(newCard);
            });
        });

        sgf.mainFramework.megaLog("Populated a traditional Deck!");
    }


    /**
     * Shuffle the deck (CardArray).  *Quick shuffle 25 times.
     */
    shuffleDeck() {

        let minShuffles = 25

        let tempCards = this.CardArray;


        for (let x = 0; x < minShuffles; x++)
            tempCards = this.quickShuffleCards(tempCards);

        this.CardArray = tempCards;

    }


    /**
     * Shuffle all the cards in the array.
     * @param {array} cArray 
     */
    quickShuffleCards(cArray) {

        let listA = [];
        let listB = [];

        //Randomly get 2 child lists
        for (let x = 0; x < cArray.length; x++) {
            if (sgf.mainFramework.randomTrueFalse())
                listA.push(cArray[x]);
            else
                listB.push(cArray[x]);
        }

        //Randomly determine which comesFirst
        if (sgf.mainFramework.randomTrueFalse())
            return listA.concat(listB);
        else
            return listB.concat(listA);

    }


    dealACard() {

        if (this.CardArray.length > 0) {
            let cardToDeal = this.CardArray.shift();

            return cardToDeal;
        }
        else
            throw new Error("Can't Deal, No Cards in the Deck!")
    }












    //Experiemental functions ------------------------------------------------------------------



    //OBSOLETE/DEPRECATED - don't use this until it's redone.
    //TODO: Maybe finish this? - probably don't go with this approach...
    shuffleCardsRecursive(cardArray) {

        var sliceSize = 5;


        console.log("made it here!");
        let extraArr = [];

        let currentArr = cardArray;


        //If there's extras recurse
        if (cardArray.length > sliceSize) {
            let extras = cardArray.slice(5);
            extraArr = this.shuffleCardsRecursive(extras)

            currentArr = cardArray.slice(0, 5);
        }

        //Base case
        if (currentArr.length < sliceSize + 1) {

            let newArr = [];

            //Shuffle random
            while (newArr.length < currentArr.length) {
                for (let x = 0; x < currentArr.length; x++) {

                    if (currentArr[x]) {
                        if (sgf.mainFramework.randomTrueFalse()) {
                            newArr.push(currentArr[x]);
                            delete currentArr[x];
                        }
                    }
                }
            }

            currentArr = newArr;

        }

        return currentArr.concat(extraArr);
    }


    toMap(){

        let cardMapArray = [];
        this.CardArray.forEach(x => cardMapArray.push(x.toMap()) );

        let mapObj = {
            CardArray:  cardMapArray
        }

        return mapObj;
    }

    fromMap(mapObj){

        this.CardArray = [];

        mapObj.CardArray.forEach((x) => {
            let c = new Card();
            this.CardArray.push(c.fromMap(x));
        });
    }



}


