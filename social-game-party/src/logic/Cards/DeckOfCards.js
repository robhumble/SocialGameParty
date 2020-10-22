import Card from "@/logic/Cards/Card.js";
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
    }


    populateTraditionalDeck() {

        this.traditionalSuits.forEach(s => {
            this.tradtionalValues.forEach(v => {
                let newCard = new Card();
                newCard.populateTraditional(s.name, s.color, v);
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
     * Shuffle n number of cards
     * @param {array} cardArray 
     */
    quickShuffleCards(cardArray) {

        let listA = [];
        let listB = [];

        //Randomly get 2 child lists
        for (let x = 0; x < cardArray.length; x++) {
            if (sgf.mainFramework.randomTrueFalse())
                listA.push(cardArray[x]);
            else
                listB.push(cardArray[x]);
        }

        //Randomly determine which comesFirst
        if (sgf.mainFramework.randomTrueFalse())
            return listA.concat(listB);
        else
            return listB.concat(listA);

    }



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



}


