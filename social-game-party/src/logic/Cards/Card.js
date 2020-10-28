export default class Card {

    CardType = ""

    //Traditional Card Properties
    Suit = ""
    Color = ""
    Value = ""

    //Other Card Properties
    Title = ""
    Message = ""

    isFaceUp = false

    constructor() {
    }

    populateTraditional(suit, color, value) {
        this.CardType = "traditional";

        this.Suit = suit;
        this.Color = color;
        this.Value = value;
    }

    populateOther(title, mes) {
        this.CardType = "message";

        this.Title = title;
        this.Message = mes;
    }
}


