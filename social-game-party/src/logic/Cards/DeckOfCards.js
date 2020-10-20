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

}


