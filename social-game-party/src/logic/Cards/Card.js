export default class Card {

    Id = ""

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

    populateTraditional(id,suit, color, value) {
        this.CardType = "traditional";

        this.Id = id;

        this.Suit = suit;
        this.Color = color;
        this.Value = value;
    }

    populateOther(id,title, mes) {
        this.CardType = "message";

        this.Id = id;

        this.Title = title;
        this.Message = mes;
    }

    flipCard(){
        
        this.isFaceUp = !this.isFaceUp;

    }
}


