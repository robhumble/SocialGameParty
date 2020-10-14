export default class Card {

    CardType = ""

    //Traditional Card Properties
    Suit = ""
    Color = ""
    Value = ""
    Symbol = ""

    //Other Card Properties
    Title = ""
    Message = ""

    constructor() {
    }

    populateTraditional(suit, color, value, symbol) {
        this.CardType = "traditional";

        this.Suit = suit;
        this.Color = color;
        this.Value = value;
        this.symbol = symbol;
    }

    populateOther(title, mes) {
        this.Title = title;
        this.Message = mes;
    }
}


